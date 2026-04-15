# react-pxl — Project Plan

> *React, rendered to pixels. Not DOM.*

## Project Name: `react-pxl`
- npm package: `react-pxl`
- GitHub repo: `react-pxl`
- Tagline: "React → Canvas. Declarative UI, pixel-perfect rendering."

## Problem Statement

Build a mid-level React renderer that targets HTML Canvas instead of DOM, enabling:
1. **General-purpose UI rendering** — replace DOM for performance-critical scenarios
2. **AI-generated UI rendering** — provide a target where LLMs can output declarative JSX that renders to canvas directly

The project uses `react-reconciler` for React integration, **Yoga WASM** for flexbox layout, and **Canvas 2D API** for rendering — all in TypeScript.

---

---

## Who Wants Canvas Instead of DOM? (Deep Dive)

The DOM was designed in the 1990s for **documents** — text, links, forms. It was never designed for the complex, interactive, pixel-precise applications we build today. A growing number of major companies have hit the DOM's ceiling and moved to canvas. Understanding *who* and *why* is critical to validating this project.

### 🏢 Companies That Already Made the Switch

| Company/Product | What They Switched | Why |
|---|---|---|
| **Google Docs** (2024-2025) | Main editor → Canvas | DOM couldn't handle large documents with real-time collaboration. Canvas gives consistent rendering + better perf at scale. |
| **Google Sheets** | Spreadsheet grid → Canvas | Thousands of cells with frequent updates caused DOM layout thrashing. Canvas renders the grid as pixels. |
| **Google Maps** | Map layer → Canvas/WebGL | Millions of vector tiles + smooth pan/zoom impossible with DOM elements. |
| **Figma** | Entire design surface → WebGL/Canvas | Pixel-perfect vector editing with thousands of objects. DOM couldn't provide the control or performance needed. Uses hidden DOM for accessibility. |
| **MURAL** | Whiteboard → Canvas | Real-time collaborative editing of thousands of objects by multiple users simultaneously. |
| **Flutter Web** (Google) | All UI → Canvas (CanvasKit/Skia WASM) | Google's answer to "write once, run everywhere" — canvas provides identical rendering on every platform. Made it the **default renderer** over DOM. |
| **AG Charts** | Data visualization → Canvas | 100K+ data points in charts. SVG/DOM broke down at this scale. |
| **tldraw / Excalidraw** | Drawing surface → Canvas | Real-time shape rendering, pan/zoom, multi-user collaboration. React manages state, canvas renders. |

**The pattern is clear**: every company hitting performance walls, needing pixel consistency, or managing complex real-time interactions is moving to canvas.

### 🎯 Who Specifically Wants a React Canvas Renderer?

#### Target User 1: Teams Building "Figma-class" Applications
**Who**: Startups and teams building design tools, whiteboard apps, diagram editors, no-code builders, collaborative workspaces.
**Pain today**: They use React for the UI shell (toolbars, panels, dialogs) but must drop down to imperative canvas code for the main viewport. There's no declarative React bridge — they maintain two mental models.
**What they want**: Write `<View><Rect /><Text /></View>` in JSX and have it render to canvas with proper layout. Keep React's component model, hooks, and state management for the canvas content too.

#### Target User 2: Data-Dense Dashboard Builders
**Who**: FinTech companies, IoT platforms, monitoring tools (Datadog-like), trading platforms, analytics dashboards.
**Pain today**: DOM-based React dashboards with 1000+ elements lag. Charts use canvas already, but the surrounding UI (grids, tables, panels) is still DOM and can't keep up with real-time data streams.
**What they want**: Render the entire dashboard — charts, tables, KPIs, alerts — on a single canvas at 60fps, still using React's familiar programming model.

#### Target User 3: AI/LLM Application Developers
**Who**: Teams building AI-generated UI products (v0-like tools, AI dashboards, autonomous agents with visual output).
**Pain today**: LLMs generate HTML/CSS that's inconsistent across browsers, has CSS specificity issues, and is hard to visually diff/test. DOM output is nondeterministic.
**What they want**: AI outputs a simple JSX tree → canvas renders it identically every time. No CSS quirks. Easy to screenshot-diff. Fast to iterate in an AI feedback loop.

#### Target User 4: Cross-Platform Consistency Seekers
**Who**: Enterprise teams shipping to Windows, Mac, Linux, various browsers. Teams burned by CSS inconsistencies.
**Pain today**: The same CSS renders differently on Chrome vs Firefox vs Safari. Font metrics vary. Subpixel rendering differs. QA is a nightmare.
**What they want**: Same JSX → same pixels on every platform. Canvas provides this guarantee that DOM/CSS fundamentally cannot.

#### Target User 5: Performance-Critical Internal Tools
**Who**: Companies building internal tools that don't need SEO or public accessibility (admin panels, internal dashboards, dev tools).
**Pain today**: Their React apps slow down as complexity grows. They don't need DOM's SEO or accessibility features — they need speed.
**What they want**: Drop-in React rendering that's faster than DOM, without changing their component architecture.

### 🔍 Why Existing Solutions Don't Satisfy Them

| Solution | What It Does | What's Missing |
|---|---|---|
| **react-konva** | React wrapper around Konva.js (canvas drawing library) | No layout engine. No flexbox. Not a general UI renderer — it's for drawing shapes. No text reflow, no scroll, no form controls. |
| **react-three-fiber** | React renderer for Three.js (3D WebGL) | 3D-focused. Massive overkill for 2D UI. No layout engine for UI purposes. |
| **react-canvas** (Flipboard, 2015) | Early attempt at React → Canvas for scrolling lists | Abandoned. No layout engine. Very limited scope (scrollable lists only). |
| **react-2d-canvas** | JSX for drawing 2D shapes | Drawing library, not UI framework. No layout, no events, no components. |
| **Flutter Web** | Full UI framework rendering to canvas | Not React. Dart language. Entirely different ecosystem. Can't use npm, React hooks, or existing JS libraries. |
| **Custom DIY** (react-reconciler) | Roll your own renderer | Works, but every team rebuilds layout, events, text, scrolling from scratch. Enormous effort duplication. |

**The gap**: There is no open-source project that provides **React + flexbox layout + canvas rendering + event system + text handling** as an integrated package. Every team that needs this today builds it from scratch or compromises.

---

## Strategic Value Analysis: Is This Worth Building in the AI Age?

### ✅ YES — and the AI Era Makes It *More* Valuable, Not Less

**1. AI Makes "Canvas-First" More Accessible**
The biggest barrier to canvas UI has always been the development cost — you must build layout, events, text handling, and accessibility yourself. But:
- **AI can generate canvas component code** far more reliably than CSS (no specificity conflicts, no layout edge cases)
- **AI assistants (Copilot, etc.)** can help developers build canvas components faster, reducing the "hard to develop" disadvantage
- The project itself can leverage AI for development, making it feasible for a smaller team

**2. AI-Generated UI Demands Deterministic Rendering**
- LLMs generate UI iteratively: generate → render → evaluate → refine. This loop requires **deterministic rendering** — same input must produce same output. DOM + CSS is inherently nondeterministic (browser differences, font loading, async layout).
- Canvas provides the guarantee: same draw calls → same pixels. This makes AI-generated UI **testable, diffable, and reliable**.

**3. AI Agents Need Lightweight Rendering Targets**
- AI agents generating visual output (dashboards, reports, diagrams) need a rendering target that's fast and controllable.
- Canvas is lighter than DOM — no layout engine overhead, no reflow, no style recalculation.
- Server-side rendering via `node-canvas` enables AI to generate and evaluate UI without a browser.

**4. The Design-to-Code Pipeline Simplifies**
- Traditional: Figma → HTML/CSS → fight with layout → debug across browsers
- Canvas: Figma → style props (x, y, width, height, colors) → render to canvas
- The mapping from design tools to canvas is more natural because design tools ARE canvas applications.

**5. Market Timing Is Right**
- Google Docs/Sheets moving to canvas validates the approach at the largest scale.
- Flutter Web proves a full UI framework on canvas is viable.
- React ecosystem is mature but lacks this piece.
- Growing frustration with CSS complexity in the React community.

### ⚠️ Honest Challenges

| Challenge | Severity | Mitigation |
|---|---|---|
| **Accessibility** | High | Shadow DOM approach (like Figma). AI can help auto-generate a11y overlays. For internal tools, this is less critical. |
| **Text input** | High | Hidden DOM `<input>` overlay technique (proven by Figma, Google Docs). |
| **Text selection / copy-paste** | Medium | Clipboard API + hidden DOM textarea. |
| **No existing component ecosystem** | Medium | Build core components. AI can help generate more. Style-prop system (like React Native) reduces the need for CSS-in-JS. |
| **Learning curve** | Medium | React developers already know JSX and hooks — only the styling model changes (CSS → style props). Similar to React Native's learning curve. |
| **Bundle size (Yoga WASM ~200KB)** | Low-Medium | Lazy loading. Tree-shaking. For the target use cases (complex apps), 200KB is acceptable. |

### 📊 Final Verdict

**This project is valuable and worth building.** Here's the honest assessment:

- **Who it's for**: Teams building complex, interactive, data-dense, or AI-generated UIs where DOM performance is the bottleneck and SEO/public accessibility aren't primary concerns.
- **Who it's NOT for**: Simple websites, content-heavy pages, blogs, e-commerce storefronts where DOM + CSS is perfectly fine.
- **Competitive advantage**: First OSS React canvas renderer with integrated layout engine + event system. The "React Native for Canvas" positioning is strong.
- **AI-era multiplier**: AI makes canvas UI development faster (reducing the main barrier) while simultaneously increasing demand for deterministic, programmable rendering targets.
- **Risk**: High technical complexity, but each sub-problem (layout, events, text) has proven solutions from Figma, Google Docs, and Flutter Web to learn from.

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                  User JSX                    │
│  <View style={{flexDirection: 'row'}}>       │
│    <Text>Hello</Text>                        │
│    <Image src="..." />                       │
│  </View>                                     │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          React Reconciler Layer              │
│  (react-reconciler host config)             │
│  Maps JSX elements to internal node tree    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Layout Engine (Yoga WASM)          │
│  Computes flexbox layout for all nodes      │
│  Outputs: { x, y, width, height } per node  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│          Canvas Render Pipeline              │
│  Dirty-rect tracking → draw commands        │
│  Text rendering, image loading, clipping    │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Event System                         │
│  Hit testing, synthetic events              │
│  Bubbling/capturing like DOM events         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│       Accessibility Layer (Optional)         │
│  Shadow DOM with ARIA attributes            │
│  Mirrors canvas tree for screen readers     │
└─────────────────────────────────────────────┘
```

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Language | TypeScript | Type safety, great DX, browser-native |
| React Integration | `react-reconciler` | Official API for custom renderers |
| Layout | `yoga-wasm-web` | Facebook's flexbox engine, WASM build for browser |
| Rendering | Canvas 2D API | Ubiquitous, good enough for UI (WebGL upgrade path later) |
| Text Measurement | Canvas `measureText` + offscreen canvas | Required for Yoga text node sizing |
| Build | Vite + tsup | Fast dev server + library bundling |
| Testing | Vitest + Playwright | Unit tests + visual regression |
| Package | npm (ESM + CJS) | Standard distribution |

---

## Implementation Phases

### Phase 1: Foundation — Reconciler + Basic Rendering ✅ COMPLETE
> Get React JSX rendering rectangles and text on canvas.

- [x] **1.1** Project scaffolding (monorepo: core, reconciler, layout, renderer, events, components, ai-bridge)
- [x] **1.2** `react-reconciler` host config (create, update, delete nodes; React 19 / reconciler 0.31 compat)
- [x] **1.3** Internal node tree (PxlNode, PxlTextNode, PxlImageNode)
- [x] **1.4** Yoga WASM integration (style → Yoga nodes, layout compute, text measurement)
- [x] **1.5** Canvas render loop (rAF pipeline, draw rect/text/image, rounded rects, opacity, clipping)
- [x] **1.6** `render()` / `unmount()` API with sync rendering
- [x] **1.7** Unit tests (54 passing) + E2E visual diff pipeline

**Bonus — DOM Compatibility (complete):**
- [x] HTML element mapping (`<div>`, `<span>`, `<h1>`-`<h6>`, `<p>`, `<img>`, `<button>`, etc.)
- [x] Browser UA-style element defaults
- [x] Tailwind utility class parser (runtime, cached, full color palette)
- [x] Style shorthand resolution (`margin`, `padding`, `borderWidth`, `borderRadius`)

**Validation infrastructure (complete):**
- [x] Playwright E2E: screenshots react-dom vs react-pxl, pixelmatch comparison
- [x] `validate.sh` runner (UT + E2E), artifacts in `validation-results/`
- [x] Current result: **1.07% pixel diff** (well within 5% tolerance)

### Phase 2: Rendering Pipeline — Text, Images, Styling ✅ COMPLETE
> Make it visually useful.

- [x] **2.1** Text rendering — word wrapping, font string, measurement for Yoga, alignment
- [x] **2.2** Image rendering — async loading, object-fit (fill/contain/cover/none/scale-down), intrinsic sizing, error placeholders, re-render on load
- [x] **2.3** Background colors, borders, border-radius (rounded rects)
- [x] **2.4** Box shadows and opacity
- [x] **2.5** Clipping (overflow: hidden)
- [x] **2.6** Dirty-rect optimization — union-rect clipping when ≤8 small dirty regions, full render fallback
- [x] **2.7** HiDPI / devicePixelRatio support

### Phase 3: Event System
> Enable interactivity.

- [x] **3.1** Hit testing — point-in-rect with tree traversal (z-order aware) *(scaffolded)*
- [x] **3.2** Synthetic event system (onClick, onPointerDown, onPointerMove, etc.) *(scaffolded)*
- [x] **3.3** Event dispatcher with bubbling *(scaffolded)*
- [ ] **3.4** Focus management and keyboard events
- [ ] **3.5** Scroll containers (virtual scrolling on canvas)
  - `overflow: 'scroll'` triggers implicit virtualization — no new components or API
  - Render-phase culling: skip drawing children outside scroll viewport
  - Layout-phase caching: Yoga computes all positions, skip re-layout for unchanged off-screen nodes
  - Reconcile-phase deferral: use `startTransition` to defer mounting off-screen children
  - Scroll offset tracking via wheel/touch events on canvas
  - Developer syntax stays identical to non-scrolling lists:
    ```tsx
    <div style={{ height: 600, overflow: 'scroll' }}>
      {items.map(item => <Row key={item.id} {...item} />)}
    </div>
    ```
- [ ] **3.6** Cursor management (pointer, text, etc.)

### Phase 4: Advanced Features
> Production-readiness.

- [ ] **4.1** Text input component (caret, selection, IME support)
- [ ] **4.2** Animation system (spring-based or requestAnimationFrame integration)
- [ ] **4.3** Accessibility shadow DOM (mirror tree to hidden DOM for screen readers)
- [ ] **4.4** React DevTools integration (custom renderer hook)
- [ ] **4.5** Server-side rendering with node-canvas
- [ ] **4.6** Performance profiling and benchmarks vs DOM

### Phase 5: AI Integration Layer
> Make it AI-native.

- [ ] **5.1** Schema definition for AI-friendly component API (JSON schema for LLM output)
- [ ] **5.2** JSON-to-JSX bridge (AI outputs JSON → render to canvas)
- [ ] **5.3** Streaming render support (partial trees render progressively)
- [x] **5.4** Visual diff tooling (pixelmatch-based, integrated in E2E)
- [ ] **5.5** Example: LLM-generated dashboard that renders entirely on canvas
- [ ] **5.6** Documentation and examples for AI code generation workflows

### Phase 6: Ecosystem & Polish
> Community adoption.

- [ ] **6.1** Pre-built component library (Button, Input, ScrollView, List, etc.)
- [ ] **6.2** Theming system (design tokens → canvas styles)
- [ ] **6.3** Documentation site with live playground
- [ ] **6.4** Performance benchmark suite (vs react-dom, react-konva, Flutter web)
- [ ] **6.5** npm publish, GitHub repo, CI/CD pipeline
- [ ] **6.6** Migration guide from react-dom

---

## Project Structure

```
react-pxl/
├── packages/
│   ├── core/                  # Internal node tree, types, utilities
│   │   ├── src/
│   │   │   ├── nodes/         # CanvasNode, TextNode, ImageNode
│   │   │   ├── styles/        # Style parsing, defaults
│   │   │   └── types.ts       # Shared type definitions
│   │   └── package.json
│   ├── reconciler/            # react-reconciler host config
│   │   ├── src/
│   │   │   ├── hostConfig.ts  # The reconciler implementation
│   │   │   ├── renderer.ts    # render() API
│   │   │   └── index.ts
│   │   └── package.json
│   ├── layout/                # Yoga WASM integration
│   │   ├── src/
│   │   │   ├── yogaBridge.ts  # Map style props to Yoga API
│   │   │   ├── textMeasure.ts # Text measurement for Yoga
│   │   │   └── index.ts
│   │   └── package.json
│   ├── renderer/              # Canvas 2D rendering pipeline
│   │   ├── src/
│   │   │   ├── pipeline.ts    # Render loop, dirty tracking
│   │   │   ├── drawRect.ts    # Rectangle drawing
│   │   │   ├── drawText.ts    # Text drawing
│   │   │   ├── drawImage.ts   # Image drawing
│   │   │   └── index.ts
│   │   └── package.json
│   ├── events/                # Event system
│   │   ├── src/
│   │   │   ├── hitTest.ts     # Point-in-rect hit testing
│   │   │   ├── synthetic.ts   # Synthetic event classes
│   │   │   ├── dispatcher.ts  # Bubbling/capturing
│   │   │   └── index.ts
│   │   └── package.json
│   ├── components/            # Pre-built UI components
│   │   ├── src/
│   │   │   ├── View.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Image.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── TextInput.tsx
│   │   │   └── ScrollView.tsx
│   │   └── package.json
│   └── ai-bridge/             # AI integration utilities
│       ├── src/
│       │   ├── schema.ts      # JSON schema for LLM output
│       │   ├── jsonToJsx.ts   # JSON → JSX converter
│       │   ├── streaming.ts   # Streaming render support
│       │   └── diff.ts        # Visual diff tooling
│       └── package.json
├── apps/
│   ├── playground/            # Vite dev app for testing
│   ├── docs/                  # Documentation site
│   └── benchmarks/            # Performance benchmarks
├── package.json               # Workspace root (pnpm/turborepo)
├── tsconfig.json
└── README.md
```

---

## Key Design Decisions

1. **Yoga for layout, not custom**: Yoga is battle-tested (React Native uses it). Reinventing flexbox is a multi-year effort.
2. **Canvas 2D first, WebGL later**: 2D API is simpler and sufficient for UI. WebGL can be an optional backend for extreme perf.
3. **Monorepo with small packages**: Each layer is independently testable and replaceable.
4. **Shadow DOM for accessibility**: Instead of trying to make canvas accessible directly, mirror the tree to a hidden DOM. This is what Figma does.
5. **AI-bridge as separate package**: Keeps the core renderer pure; AI features are opt-in.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Text input on canvas is extremely hard | High | Start with read-only text; use hidden DOM `<input>` overlay for text editing (like Figma) |
| Yoga WASM bundle size (~200KB) | Medium | Lazy-load Yoga; provide option for simpler layout modes |
| No CSS ecosystem (Tailwind, styled-components) | Medium | Build a style-prop system inspired by React Native's StyleSheet |
| Performance may not beat DOM for simple UIs | Low | Target data-dense/complex UIs where canvas clearly wins; benchmark early |
| React reconciler API changes | Low | Pin react-reconciler version; follow React team's guidance |

---

## Success Metrics

- **Phase 1 milestone**: Render a flexbox layout with 1000 nodes at 60fps
- **Phase 2 milestone**: Render a UI that visually matches a react-dom equivalent ✅ **Achieved** (1.07% pixel diff)
- **Phase 3 milestone**: Interactive todo app running entirely on canvas
- **Phase 5 milestone**: LLM generates a complete dashboard UI from a text prompt, rendered on canvas
- **Overall**: npm downloads, GitHub stars, community contributions
