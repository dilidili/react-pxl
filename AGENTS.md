# AGENTS.md

> Guidelines for AI coding agents working on react-pxl.

## Project Context

react-pxl is a React custom renderer targeting HTML Canvas instead of DOM.  
See [`designs/`](./designs/) for architecture docs, execution plans, and roadmap.

| Document | Purpose |
|----------|---------|
| [`designs/plan.md`](./designs/plan.md) | Project plan, architecture, phased roadmap, progress |
| [`designs/execution-dom-compat.md`](./designs/execution-dom-compat.md) | DOM-compatible JSX + Tailwind utility classes |
| [`designs/agent-workflow.md`](./designs/agent-workflow.md) | Code generator → validator agent pipeline |

## Architecture

```
JSX → react-reconciler → PxlNode tree → Yoga WASM layout → Canvas 2D draw
```

**Packages** (`packages/`): core, reconciler, layout, renderer, events, components, ai-bridge

## Commands

```bash
npm test                          # vitest unit tests
npm run dev                       # vite playground (apps/playground/)
./scripts/validate.sh             # full validation: UT + E2E visual diff
./scripts/validate.sh --ut        # unit tests only
./scripts/validate.sh --e2e       # E2E only (needs LD_LIBRARY_PATH=~/lib)
```

## Conventions

- **TypeScript strict** — no `any` except Yoga WASM interop
- **DOM-compatible JSX** — `<div>`, `<span>`, `<p>`, `<h1>`, `<img>` all work
- **Tailwind classes** — `className="flex p-4 bg-white"` parsed at runtime
- **Custom primitives** — `<View>`, `<Text>`, `<Image>` for explicit control
- **Style merge order** — elementDefaults ← className ← inline style
- **Tests** — colocated in `__tests__/` dirs, vitest + Playwright E2E
- **No DOM deps** in core/layout/renderer — canvas-only
