# AGENTS.md

> Guidelines for AI coding agents (Copilot, etc.) working on react-pxl.

## Project Context

react-pxl is a React custom renderer targeting HTML Canvas instead of DOM.  
See [`designs/`](./designs/) for architecture docs, value analysis, and phased roadmap.

### Key Documents

| Document | Description |
|----------|-------------|
| [`designs/plan.md`](./designs/plan.md) | Full project plan: problem statement, value analysis, architecture, 6-phase roadmap, project structure, risks |

## Architecture (quick ref)

```
JSX → react-reconciler → PxlNode tree → Yoga WASM layout → Canvas 2D draw
```

**Monorepo packages** (`packages/`):
| Package | Role |
|---------|------|
| `core` | Node tree types, style system |
| `reconciler` | `react-reconciler` host config, `render()` API |
| `layout` | Yoga WASM bridge (flexbox) |
| `renderer` | Canvas 2D pipeline (draw rect/text/image) |
| `events` | Hit testing, synthetic events, dispatcher |
| `components` | JSX primitives: View, Text, Image |
| `ai-bridge` | LLM integration (Phase 5) |

## Commands

```bash
npm test          # vitest — run all unit tests
npm run dev       # vite playground at apps/playground/
npm run typecheck # tsc --noEmit
```

## Conventions

- **TypeScript strict** — no `any` except Yoga WASM interop
- **Style props** — React Native-style (not CSS classes). See `core/src/styles/`
- **Node types** — `pxl-view`, `pxl-text`, `pxl-image` in reconciler
- **Tests** — colocated in `__tests__/` dirs, vitest
- **No DOM dependencies** in core/layout/renderer — canvas-only

## Key Design Decisions

1. **Yoga WASM for layout** — don't reinvent flexbox
2. **Canvas 2D first** — WebGL is a future optimization
3. **Hidden DOM overlay for text input** (Figma's approach)
4. **Shadow DOM for accessibility** (Phase 4)
5. **AI-bridge is opt-in** — core renderer stays pure

## Current Phase

Phase 1 (Foundation) mostly complete. Next priorities:
- End-to-end Yoga integration testing
- Phase 2: text rendering, images, visual styling
- See plan.md "Implementation Phases" for full breakdown
