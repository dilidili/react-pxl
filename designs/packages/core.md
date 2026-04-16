# Package: @react-pxl/core

> Node tree, types, styles, and utilities — the foundation layer.

## Purpose

Defines the internal node tree that all other packages operate on. Contains no DOM or Canvas dependencies.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `PxlNode` | class | View container (maps to `<div>`, `<section>`, etc.) |
| `PxlTextNode` | class | Text element with wrapping, measurement, font inheritance |
| `PxlImageNode` | class | Async image loading with intrinsic sizing |
| `resolveStyle()` | function | Expands shorthand props (`margin` → `marginTop/Right/Bottom/Left`) |
| `parseTailwind()` | function | Runtime Tailwind class → PxlStyle, cached |
| `clearTailwindCache()` | function | Clears the Tailwind parse cache |
| `wrapText()` | function | Word-wrap text to a max width |
| `getElementDefaults()` | function | Browser UA defaults for an HTML element name |
| `mergeStyles()` | function | Merge elementDefaults ← className ← inline style |
| `setTreeDirtyCallback()` | function | Register callback when root node becomes dirty |
| `PxlStyle` | type | ~100 CSS-like properties (layout, visual, text, image) |
| `PxlAnyNode` | type | Union of all node types |

## Key Design

**Dirty flag propagation** — `node.markDirty()` bubbles up via parent chain. When root is reached, fires `onTreeDirtyCallback` which triggers the render pipeline.

**Style merge order** — `elementDefaults ← className ← inline style` (inline wins).

**Tailwind parser** — runtime parsing with `Map<string, PxlStyle>` cache. Supports spacing, flex, typography, colors, borders, opacity. No build step.

## Files

```
src/
  nodes/PxlNode.ts        — Base container, children, layout, dirty tracking, hit testing
  nodes/PxlTextNode.ts    — Text content, font string, measureText() for Yoga
  nodes/PxlImageNode.ts   — Async HTMLImageElement loading, naturalWidth/Height
  nodes/types.ts           — PxlNodeType, PxlEventHandler, prop interfaces
  styles/styles.ts         — PxlStyle interface, resolveStyle()
  styles/tailwind.ts       — parseTailwind(), color palette, spacing/font/radius scales
  styles/elementDefaults.ts — ELEMENT_DEFAULTS, TEXT_ELEMENTS, mergeStyles()
```

## Dependencies

None.
