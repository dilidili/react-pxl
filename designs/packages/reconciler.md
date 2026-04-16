# Package: @react-pxl/reconciler

> React reconciler host config — bridges React to the PxlNode tree.

## Purpose

Implements `react-reconciler` host config so React JSX operations (create, update, delete) map to PxlNode mutations. Provides the public `render()` and `unmount()` API.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `render(element, canvas, callback?)` | function | Mount a React tree onto a canvas element |
| `unmount(canvas)` | function | Tear down a previously rendered tree |
| `hostConfig` | object | The react-reconciler host config (internal) |

## Key Design

**`render()` orchestrates all packages:**
1. Creates `YogaBridge` (async WASM init)
2. Creates `CanvasPipeline` (canvas 2D context, HiDPI, rAF loop)
3. Creates `EventDispatcher` (pointer, keyboard, wheel, focus, cursor)
4. Builds React reconciler container
5. On each commit: rebuilds Yoga tree → computes layout → marks pipeline dirty

**Element mapping** — `createInstance()` maps HTML tags and custom primitives to node types:
- `div`, `section`, `nav`, etc. → `PxlNode`
- `span`, `p`, `h1`–`h6` → `PxlTextNode`
- `img` → `PxlImageNode`
- `View`/`Text`/`Image` → custom primitives

**Props resolution** — on create and update, merges `elementDefaults ← className (Tailwind) ← inline style`.

## Files

```
src/
  hostConfig.ts — All react-reconciler methods (createInstance, appendChild, commitUpdate, etc.)
  renderer.ts   — render() / unmount() API, per-canvas root state management
```

## Dependencies

`@react-pxl/core`, `@react-pxl/layout`, `@react-pxl/renderer`, `@react-pxl/events`, `react-reconciler`
