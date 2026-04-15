# AGENTS.md

> Guidelines for AI coding agents (Copilot, etc.) working on react-pxl.

## Project Context

react-pxl is a React custom renderer targeting HTML Canvas instead of DOM.  
See [`designs/`](./designs/) for architecture docs, value analysis, and phased roadmap.

### Key Documents

| Document | Description |
|----------|-------------|
| [`designs/plan.md`](./designs/plan.md) | Full project plan: problem statement, value analysis, architecture, 6-phase roadmap, project structure, risks |
| [`designs/execution-dom-compat.md`](./designs/execution-dom-compat.md) | Execution plan: DOM-compatible JSX rendering + Tailwind utility class support |
| [`designs/agent-workflow.md`](./designs/agent-workflow.md) | Agent workflow: code generator + validator agent architecture |

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
npm test              # vitest — run all unit tests
npm run dev           # vite playground at apps/playground/
npm run typecheck     # tsc --noEmit
./scripts/validate.sh # full validation: UT + E2E visual diff
./scripts/validate.sh --ut   # unit tests only
./scripts/validate.sh --e2e  # E2E visual diff only
```

## Conventions

- **TypeScript strict** — no `any` except Yoga WASM interop
- **Style props** — React inline style format (camelCase), same as react-dom
- **DOM-compatible JSX** — `<div>`, `<span>`, `<p>`, `<h1>`, `<img>`, `<button>` all work (see execution-dom-compat.md)
- **Tailwind utility classes** — `className="flex p-4 bg-white"` parsed at runtime
- **Custom primitives also work** — `<View>`, `<Text>`, `<Image>` for explicit canvas control
- **Node types** — HTML elements auto-mapped in reconciler; custom via `pxl-view`, `pxl-text`, `pxl-image`
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

---

## Agent Workflow: Code Generator → Validator

After the **code generator agent** makes changes, invoke the **validator agent**
to run the full test suite. See [`designs/agent-workflow.md`](./designs/agent-workflow.md) for details.

### Validator Agent

Invoke as a `task` agent with a low-cost model (e.g., `claude-haiku-4.5`):

```
You are the validator agent for react-pxl. Run the validation suite and report.

Steps:
1. cd /path/to/react-pxl
2. Run: ./scripts/validate.sh
3. Read validation-results/report.json
4. Report: PASS if all UT pass AND visual diff < 5%, else FAIL with details
5. If FAIL, summarize what broke and suggest fixes

Do NOT modify source code. Only run tests and report.
```

### Validation Artifacts

After running `./scripts/validate.sh`, check `validation-results/`:

| File | Description |
|------|-------------|
| `dom-baseline.png` | react-dom screenshot (ground truth) |
| `pxl-output.png` | react-pxl screenshot (canvas output) |
| `diff.png` | Pixel diff overlay (red = differences) |
| `report.json` | Machine-readable: diff %, pass/fail, timestamp |
| `ut-output.txt` | Unit test log |
| `e2e-output.txt` | E2E test log |

### E2E Test: Visual Fidelity

The E2E test renders the **same TestComponent** (`e2e/fixtures/TestComponent.tsx`)
with both react-dom and react-pxl, screenshots both at 800×600, and compares
with pixelmatch. Passes if pixel diff < 5% (configurable in `e2e/visual-diff.spec.ts`).
