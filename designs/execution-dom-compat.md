# Execution Plan: DOM-Compatible JSX Rendering

> **Goal**: Existing React JSX (`<div>`, `<span>`, `<p>`, etc.) renders directly to canvas
> without rewriting to custom components. Zero migration cost.

## The Insight

Our `PxlStyle` already uses React's camelCase inline style format — identical to `react-dom`.
The reconciler just needs an element mapping layer + default styles per HTML element.

```tsx
// This existing react-dom code...
<div style={{ display: 'flex', padding: 20, gap: 12 }}>
  <h1 style={{ color: '#333' }}>Dashboard</h1>
  <p>Rendered entirely on canvas.</p>
  <button onClick={handleClick} style={{ backgroundColor: '#3b82f6', color: '#fff' }}>
    Click me
  </button>
</div>

// ...works with react-pxl. Same JSX, same inline styles. Just swap the render call:
// ReactDOM.render(<App />, domEl)  →  ReactCanvas.render(<App />, canvasEl)
```

## What Changes

### 1. Element Mapping (reconciler hostConfig)

Map HTML element names → PxlNode types with semantic defaults:

```
div, section, article, nav, aside, main, header, footer → PxlNode (view)
span, a, em, strong, small, label                       → PxlTextNode (inline text)
p, h1, h2, h3, h4, h5, h6, blockquote                  → PxlTextNode (block text)
img                                                      → PxlImageNode
button                                                   → PxlNode (interactive view)
ul, ol, li                                               → PxlNode (list layout)
```

### 2. Default Styles (browser-like)

Each element gets sensible defaults matching browser UA stylesheet:

```ts
const ELEMENT_DEFAULTS: Record<string, PxlStyle> = {
  div:    { display: 'flex', flexDirection: 'column' },
  span:   { /* inline */ },
  p:      { marginBottom: 16 },
  h1:     { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  h2:     { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  h3:     { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  h4:     { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  h5:     { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  h6:     { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  button: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, borderWidth: 1, borderColor: '#d1d5db' },
  img:    { /* sized by src or explicit style */ },
  ul:     { paddingLeft: 20, marginBottom: 16 },
  ol:     { paddingLeft: 20, marginBottom: 16 },
  li:     { marginBottom: 4 },
  strong: { fontWeight: 'bold' },
  em:     { fontStyle: 'italic' },
};
```

### 3. Tailwind-like Utility Classes

Parse className strings into PxlStyle objects. No build step — runtime parsing + caching.

```tsx
<div className="flex flex-row p-4 gap-3 bg-white rounded-lg shadow-md">
  <h1 className="text-2xl font-bold text-gray-800">Title</h1>
  <p className="text-sm text-gray-500">Subtitle</p>
</div>
```

**Approach**: Subset of Tailwind's utility classes parsed at runtime:

| Category | Classes | Maps to |
|----------|---------|---------|
| Layout | `flex`, `flex-row`, `flex-col`, `flex-wrap`, `flex-1` | flexDirection, flex |
| Spacing | `p-{n}`, `px-{n}`, `py-{n}`, `m-{n}`, `mx-{n}`, `my-{n}`, `gap-{n}` | padding, margin, gap |
| Sizing | `w-{n}`, `h-{n}`, `w-full`, `h-full`, `min-w-0` | width, height |
| Typography | `text-{size}`, `font-bold`, `font-normal`, `text-center` | fontSize, fontWeight, textAlign |
| Colors | `bg-{color}`, `text-{color}`, `border-{color}` | backgroundColor, color, borderColor |
| Borders | `rounded`, `rounded-{n}`, `border`, `border-{n}` | borderRadius, borderWidth |
| Effects | `shadow`, `shadow-{size}`, `opacity-{n}` | shadow*, opacity |
| Position | `absolute`, `relative`, `top-{n}`, `left-{n}` | position, top, left |
| Display | `hidden`, `overflow-hidden` | display, overflow |
| Align | `items-center`, `justify-between`, `self-start` | alignItems, justifyContent, alignSelf |

**Not supported** (intentionally): responsive breakpoints (`md:`, `lg:`), pseudo-classes (`:hover`, `:focus`),
animations (`animate-*`), grid (`grid-cols-*`). These require CSS engine capabilities.

**Implementation**:
```ts
// packages/styles/src/tailwind.ts
const cache = new Map<string, PxlStyle>();

export function parseTailwind(className: string): PxlStyle {
  if (cache.has(className)) return cache.get(className)!;
  const tokens = className.trim().split(/\s+/);
  const style: PxlStyle = {};
  for (const token of tokens) {
    Object.assign(style, parseToken(token));
  }
  cache.set(className, style);
  return style;
}
```

### 4. Style Merging Order

When both `className` and `style` are present:

```tsx
<div className="p-4 bg-white" style={{ padding: 20 }}>
```

Resolution: `elementDefaults ← className ← inline style` (inline wins, like CSS specificity).

## Execution Steps

| # | Task | Package | Depends On |
|---|------|---------|------------|
| E1 | Create `elementDefaults.ts` — default styles per HTML element | `core` | — |
| E2 | Update `hostConfig.createInstance` — map HTML tags to PxlNode types, merge defaults | `reconciler` | E1 |
| E3 | Create `tailwind.ts` — runtime Tailwind utility class parser with cache | `core` (new `styles/` module) | — |
| E4 | Integrate className parsing into reconciler — merge className → style on createInstance/commitUpdate | `reconciler` | E2, E3 |
| E5 | Handle `shouldSetTextContent` — detect text-bearing elements (p, h1-h6, span) with string children | `reconciler` | E2 |
| E6 | Map HTML-specific props — `src`/`alt` for img, `onClick` for button, `href` for a (store only) | `reconciler` | E2 |
| E7 | Tests — DOM-compat element mapping, default styles, Tailwind parser | `core`, `reconciler` | E1-E6 |
| E8 | Playground demo — render existing react-dom JSX on canvas unchanged | `playground` | E7 |

## What This Unlocks

1. **Zero migration**: Existing React components render to canvas by swapping the render call
2. **AI advantage**: LLMs already know `<div>` + Tailwind — they generate working canvas UI out of the box
3. **Gradual adoption**: Teams try react-pxl on existing code, then optimize with custom primitives later

## Limitations (documented, not hidden)

- **No CSS files** — className only supports utility classes, not custom CSS
- **No CSS inheritance** — each element styled independently (like React Native)
- **No `<table>`** — complex layout semantics not supported initially
- **No `<form>` / `<input>` / `<textarea>`** — text input requires Phase 4 (hidden DOM overlay)
- **No `<a>` navigation** — href stored but no browser navigation (canvas isn't a document)

## Compatibility Matrix

| Element | Supported | Notes |
|---------|-----------|-------|
| `div`, `section`, `article`, `nav`, `aside`, `main`, `header`, `footer` | ✅ | Flex container |
| `span`, `a`, `em`, `strong`, `small`, `label` | ✅ | Inline text |
| `p`, `h1`-`h6`, `blockquote` | ✅ | Block text with defaults |
| `img` | ✅ | Async loading |
| `button` | ✅ | Clickable with default border |
| `ul`, `ol`, `li` | ✅ | List layout |
| `input`, `textarea`, `select` | ❌ Phase 4 | Needs hidden DOM overlay |
| `table`, `tr`, `td`, `th` | ❌ Future | Complex layout |
| `svg`, `canvas` | ❌ | Meta-circular, not planned |
| `video`, `audio`, `iframe` | ❌ | Browser-native only |
