# Infinite List Rendering

> Transparent virtualization for large lists — zero API changes, zero new components.

## Problem

Existing DOM-based virtualization libraries (react-window, react-virtualized, tanstack-virtual) force developers to rewrite their rendering code:

```tsx
// What developers want to write:
<div style={{ height: 600, overflow: 'auto' }}>
  {items.map(item => <Row key={item.id} {...item} />)}
</div>

// What DOM libraries force:
<FixedSizeList height={600} itemCount={items.length} itemSize={35}>
  {({ index, style }) => <Row style={style} {...items[index]} />}
</FixedSizeList>
```

DOM libraries **must** do this because they cannot intercept the browser's layout/paint pipeline. They take over rendering entirely via render-prop patterns, requiring `itemCount`, `itemSize`, and a render callback instead of natural children.

## Design Principle

**No new components. No new API. `overflow: 'scroll'` is the only signal.**

```tsx
// Developer writes exactly this — identical to non-scrolling lists:
<div style={{ height: 600, overflow: 'scroll' }}>
  {items.map(item => <Row key={item.id} {...item} />)}
</div>
```

react-pxl detects `overflow: 'scroll'` and applies virtualization transparently across three pipeline layers.

## Why react-pxl Can Do This

react-pxl owns every layer of the rendering pipeline:

```
JSX → Reconciler (ours) → PxlNode tree (ours) → Yoga layout (ours) → Canvas draw (ours)
```

| Concern | DOM libraries | react-pxl |
|---------|--------------|-----------|
| Node creation | Must create real DOM nodes | Lightweight PxlNode objects (~10 props) |
| Layout engine | Browser controls it | Yoga — we control it |
| Drawing | Browser paints all DOM | We choose what to draw |
| Scroll position | Browser native scroll | We track offset ourselves |
| Intercept point | None (forced to use render-prop) | Layout + render phases |

DOM libraries can't intercept the browser's layout/paint, so they must prevent node creation via API changes. react-pxl owns the whole pipeline, so it can create all nodes cheaply, then skip layout/draw for off-screen ones — transparently.

## Three-Layer Optimization

```
         ┌─ visible (mount sync, draw) ──────── ~50 items
scroll   │
container┼─ buffer (mount sync, skip draw) ──── ~20 items
         │
         └─ off-screen (defer mount via idle) ── rest
```

### Layer 1: Render-Phase Culling (pipeline.ts)

Skip drawing children outside the scroll viewport. This is the simplest and highest-impact optimization.

```
renderNode(node, parentX, parentY):
  // For children of a scroll container:
  if (nodeBottom < scrollTop || nodeTop > scrollTop + viewportHeight):
    return  // don't draw, don't recurse into children
```

**Impact**: Reduces draw calls from O(n) to O(visible). A 10K-item list only draws ~50 items per frame.

### Layer 2: Layout-Phase Caching (yogaBridge.ts)

Yoga computes positions for all mounted children, but we cache results and skip re-layout for unchanged off-screen nodes.

- On initial mount: full Yoga layout pass (positions all items)
- On subsequent frames: only re-layout dirty nodes
- Off-screen nodes retain cached `{ x, y, width, height }` from previous computation

**Impact**: Reduces layout cost on scroll from O(n) to O(changed).

### Layer 3: Reconcile-Phase Deferral (hostConfig.ts)

Use React's `startTransition` to defer mounting off-screen children:

- Visible items + buffer zone: mount synchronously (immediate paint)
- Off-screen items: mount in idle frames via `startTransition`
- On scroll into deferred region: already-mounted items draw instantly

**Impact**: First paint renders only visible items (~2ms), remaining items fill in during idle time.

## Reconciliation at Scale

React's reconciler is the bottleneck for very large lists since it does O(n) work regardless of visibility:

| Item Count | Reconcile | PxlNode Creation | Layout + Draw |
|------------|-----------|-------------------|---------------|
| 1K | ~2ms | ~0.5ms | ~1ms |
| 10K | ~15-20ms | ~3ms | skippable (culling) |
| 100K | ~150ms+ | ~30ms | skippable (culling) |

### Mitigation: Progressive Mounting

For containers with `overflow: 'scroll'` and large child counts:

1. **Immediate**: Mount visible children + buffer (~70 items) synchronously
2. **Deferred**: Remaining children mount in idle frames via `startTransition`
3. **On scroll**: If scrolling into not-yet-mounted region, mount on demand

This uses React's built-in concurrent features rather than fighting the framework. Combined with render-phase culling, first paint cost is constant regardless of list size.

### Why This Works for react-pxl but Not DOM

Even deferred DOM node creation is expensive (each node → DOM element + style computation + CSSOM entry). react-pxl's PxlNodes are plain JS objects — deferred mounting is nearly free.

## Scroll Event Handling

Scroll offset tracked via wheel/touch events on the canvas element:

- `wheel` event → update `scrollTop` / `scrollLeft` on the scroll container node
- Touch events → momentum scrolling with deceleration
- Scroll offset clamped to `[0, contentHeight - viewportHeight]`
- `markDirty()` on scroll offset change → triggers re-render via rAF loop

## Implementation Touchpoints

| Layer | File | Change |
|-------|------|--------|
| Reconciler | `packages/reconciler/hostConfig.ts` | Detect `overflow: scroll` + large child count → wrap off-screen children in `startTransition` |
| Layout | `packages/layout/yogaBridge.ts` | Cache layout results, skip re-layout for unchanged off-screen nodes |
| Renderer | `packages/renderer/pipeline.ts` | Viewport bounds check in `renderNode()` — skip draw for off-screen children |
| Events | `packages/events/dispatcher.ts` | Wheel/touch → scroll offset tracking, momentum scrolling |
| Core | `packages/core/nodes/PxlNode.ts` | Add `scrollTop` / `scrollLeft` properties to nodes |

## Comparison with DOM Libraries

| Feature | react-window | react-virtualized | react-pxl |
|---------|-------------|-------------------|-----------|
| Syntax change required | Yes (render-prop) | Yes (render-prop) | **No** |
| Must specify item height | Yes | Yes (or measure) | **No** (Yoga computes) |
| Variable height items | Limited | CellMeasurer hack | **Automatic** |
| Nested scroll containers | Difficult | Difficult | **Natural** (Canvas clipping) |
| Memory per item | DOM node + styles | DOM node + styles | **PxlNode (~10 props)** |
| First paint for 10K items | ~5ms (windowed) | ~5ms (windowed) | **~2ms** (visible only) |
| Cross-browser consistency | Varies | Varies | **Identical** (Canvas) |

## Validation Criteria

A "before/after diff" only proves pixels changed — trivially true for any scroll. The real criteria for infinite list correctness are:

### 1. Content Correctness (per-scroll-position snapshot)

Render the same list items with react-dom at a known scroll offset. Compare against react-pxl canvas at the same scroll offset. The visible items must match.

```
Scroll to item[50] → screenshot react-dom viewport → screenshot react-pxl viewport → pixelmatch
```

This validates that the **right items** appear at the **right positions** after scroll — not just that something changed.

### 2. Item Order & Continuity

After scrolling N pixels, the first visible item should be deterministic. Verify by reading text content from the canvas (via test fixture data) or by comparing against a known-good reference.

```
scroll(500px) → first visible item should be item[K]
scroll(500px) more → first visible item should be item[K + M]
no gaps, no duplicates, no items out of order
```

### 3. Round-Trip Stability

Scroll down, then scroll back to the original position. The canvas output must be pixel-identical to the initial render. This catches:
- State leaks from virtualization
- Layout drift from cumulative rounding errors
- Missing items after recycling

```
screenshot(scrollTop=0) → scroll down 5000px → scroll back to 0 → screenshot → pixelmatch = 0
```

### 4. Performance Budget

For a 10K-item list, frame time must stay under budget during scroll:

| Metric | Target |
|--------|--------|
| First paint (visible items) | < 16ms |
| Scroll frame time | < 16ms (60fps) |
| Memory per item | < 1KB (PxlNode overhead) |

### 5. Visual Fidelity at Scroll Boundaries

Edge cases to validate:
- Partially visible items at top/bottom edges render correctly (not clipped wrong)
- First item and last item are reachable and fully visible at min/max scroll
- Content height matches expected total (no collapsed or missing space)

## Non-Goals

- **Explicit virtualization API**: No `<VirtualList>` or `<InfiniteScroll>` component. The optimization is implicit.
- **Pagination / data fetching**: This design covers rendering. Data loading (infinite scroll triggers, fetch-on-scroll) is a userland concern.
- **Horizontal virtualization**: Initial implementation targets vertical scroll. Horizontal follows the same pattern.

## Related

- [Phase 3.5 in plan.md](./plan.md) — scroll container implementation
- [Phase 2.6 in plan.md](./plan.md) — dirty-rect optimization (complementary)
