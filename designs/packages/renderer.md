# Package: @react-pxl/renderer

> Canvas 2D rendering pipeline — traverses the node tree and draws to canvas.

## Purpose

Manages the rAF render loop, traverses the PxlNode tree depth-first, and draws each node using Canvas 2D API calls.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `CanvasPipeline` | class | Render loop, tree traversal, dirty-rect optimization |
| `drawRect()` | function | Background, borders, border-radius, shadows |
| `drawText()` | function | Font rendering, word-wrap, alignment, letter-spacing |
| `drawImage()` | function | Image rendering with object-fit modes, rounded clipping |

## Key Design

**rAF loop** — `start()` registers a `requestAnimationFrame` loop. Only renders when `needsRender === true` (set by `markDirty()`).

**Dirty-rect optimization** — when ≤8 small dirty regions changed and their union covers <60% of canvas, clips to the union rect before clearing/drawing. Falls back to full render otherwise.

**HiDPI** — scales canvas by `devicePixelRatio`, applies `ctx.scale(dpr, dpr)`.

**Viewport culling** — for scroll containers (`overflow: scroll/hidden`), skips drawing children entirely outside the visible viewport.

**Scroll offset** — applies `node.scrollTop` / `node.scrollLeft` as translation offset for children of scroll containers.

**Draw pipeline per node:**
1. Skip if `display: none`
2. Apply opacity (`globalAlpha`)
3. Clip if `overflow: hidden/scroll`
4. Draw background/borders/shadows (`drawRect`)
5. Draw text content (`drawText`) or image (`drawImage`)
6. Recurse into children (with scroll offset + viewport culling)
7. Restore clip and opacity

## Files

```
src/
  pipeline.ts  — CanvasPipeline class, render loop, dirty-rect optimization, tree traversal
  drawRect.ts  — Background fill, borders, rounded rects (arcTo), shadows
  drawText.ts  — Font string, fillText, word-wrap, alignment, letter-spacing
  drawImage.ts — object-fit (fill/contain/cover/none/scale-down), rounded corner clipping
```

## Dependencies

`@react-pxl/core`
