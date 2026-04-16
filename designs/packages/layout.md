# Package: @react-pxl/layout

> Yoga WASM flexbox layout engine integration.

## Purpose

Bridges PxlNode styles to Yoga WASM, computes flexbox layout, and writes computed `{ x, y, width, height }` back to each node.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `YogaBridge` | class | Manages Yoga WASM lifecycle, builds layout tree, computes layout |
| `createTextMeasureFunction()` | function | Creates Yoga measure function for text intrinsic sizing |

## Key Design

**Async WASM init** — `YogaBridge.create()` loads `yoga-wasm-web/auto` on first call.

**Style mapping** — `applyStyles()` translates PxlStyle properties to Yoga setter calls (setFlexDirection, setJustifyContent, setAlignItems, setPadding, setMargin, setGap, setWidth/Height/Min/Max, setOverflow, etc.).

**Text measurement** — Yoga needs custom measure functions for text nodes. `PxlTextNode.measureText(ctx, maxWidth)` returns `{ width, height }` using Canvas `measureText()` + word-wrap logic.

**Layout flow:**
1. `buildTree(root)` — recursively creates Yoga nodes, sets parent-child relationships
2. `computeLayout(root, width, height)` — runs Yoga's `calculateLayout()`
3. Extracts `{ x, y, width, height }` back into `node.layout` for each PxlNode

**Node storage** — `WeakMap<PxlAnyNode, YogaNode>` allows GC when PxlNodes are collected.

## Files

```
src/
  yogaBridge.ts  — YogaBridge class, style-to-Yoga mapping, tree building, layout extraction
  textMeasure.ts — Yoga measure function factory for text intrinsic sizing
```

## Dependencies

`@react-pxl/core`, `yoga-wasm-web`
