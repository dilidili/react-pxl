# Agent Workflow: Code Generator + Validator

> **Goal**: After the code generator agent makes changes, a validator agent (low-cost model)
> automatically runs UT + E2E tests, persists results for human review.

## Workflow Overview

```
┌─────────────────────┐
│  Code Generator      │  (Copilot agent, local)
│  Makes code changes  │
└──────────┬──────────┘
           │ triggers
┌──────────▼──────────┐
│  Validator Agent     │  (low-cost model: haiku/gpt-mini)
│                      │
│  1. Run unit tests   │  (vitest)
│  2. Run E2E tests    │  (playwright screenshot diff)
│  3. Save results     │  (to validation-results/)
│  4. Report pass/fail │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Human Review        │
│  Check screenshots   │
│  in validation-results/
└─────────────────────┘
```

## E2E Visual Fidelity Test

Renders the **same JSX** with both react-dom and react-pxl, screenshots both,
and compares them with pixel diff within a tolerance.

### Test Flow

```
1. Start Vite dev server (serves both test pages)
2. Playwright opens react-dom page → screenshot → dom-baseline.png
3. Playwright opens react-pxl page → screenshot → pxl-output.png
4. pixelmatch compares the two images
5. Generates diff image highlighting differences
6. Pass if diff % < tolerance (default: 5%)
7. All artifacts saved to validation-results/
```

### Test Pages

Two HTML pages serve the same component:

- `e2e/fixtures/dom-page.html` — renders with react-dom (normal DOM rendering)
- `e2e/fixtures/pxl-page.html` — renders with react-pxl (canvas rendering)

Both import the same `TestComponent` — a simple layout with text, colors, and nesting.

### Diff Tolerance

Canvas text rendering differs from DOM text rendering (font metrics, anti-aliasing).
We accept a **5% pixel difference** by default. This catches layout regressions while
allowing expected text rendering differences.

## File Structure

```
react-pxl/
├── e2e/
│   ├── fixtures/
│   │   ├── TestComponent.tsx    # Shared component rendered by both
│   │   ├── dom-page.html        # react-dom render page
│   │   ├── dom-entry.tsx        # react-dom entry point
│   │   ├── pxl-page.html        # react-pxl render page
│   │   └── pxl-entry.tsx        # react-pxl entry point
│   ├── visual-diff.spec.ts      # Playwright E2E test
│   └── playwright.config.ts     # Playwright config
├── scripts/
│   └── validate.sh              # Run full validation (UT + E2E)
├── validation-results/           # Persisted output (gitignored, human-reviewable)
│   ├── dom-baseline.png
│   ├── pxl-output.png
│   ├── diff.png
│   └── report.json
└── AGENTS.md                     # Updated with validator workflow
```

## Validator Agent Instructions

The validator agent is invoked as a `task` agent with `model: "claude-haiku-4.5"`.

### Prompt Template

```
You are the validator agent for react-pxl. Run the validation suite and report results.

Steps:
1. Run `npm test` (unit tests with vitest)
2. Run `npx playwright test` (E2E visual diff tests)
3. Read validation-results/report.json for diff percentage
4. Report: PASS if all UT pass AND diff < 5%, else FAIL with details
5. If FAIL, summarize what broke and suggest fixes

Do NOT modify any source code. Only run tests and report.
```

## Execution Steps

| # | Task | Description |
|---|------|-------------|
| V1 | Install Playwright + pixelmatch | Add dev dependencies |
| V2 | Create shared TestComponent | Simple layout: header + cards + text, using HTML elements + Tailwind classes |
| V3 | Create dom-entry + dom-page | react-dom rendering of TestComponent in a fixed-size container |
| V4 | Create pxl-entry + pxl-page | react-pxl rendering of TestComponent on a same-size canvas |
| V5 | Create visual-diff E2E test | Playwright test: screenshot both, pixelmatch, save artifacts |
| V6 | Create validate.sh script | Runs UT + E2E, saves results to validation-results/ |
| V7 | Update AGENTS.md | Add validator workflow instructions |
| V8 | Test the full workflow | Run validate.sh, verify artifacts are generated |
