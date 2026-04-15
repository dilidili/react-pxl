# react-pxl

> React → Canvas. Declarative UI, pixel-perfect rendering.

A mid-level React renderer that targets HTML Canvas instead of DOM. Write familiar JSX with flexbox layout — get pixel-perfect canvas rendering with 60fps performance.

## Why?

The DOM was designed for documents, not complex interactive applications. Companies like Google (Docs, Sheets, Maps), Figma, and Flutter Web have moved to canvas rendering for performance, consistency, and control. **react-pxl** brings this capability to the React ecosystem.

## Features

- 🎨 **React Reconciler** — Full React 19 support via `react-reconciler`
- 📐 **Flexbox Layout** — Yoga WASM powers familiar CSS flexbox layout
- 🖼️ **Canvas 2D Rendering** — Pixel-perfect, deterministic output
- ⚡ **Event System** — Hit testing, bubbling, capturing (mirrors DOM events)
- 🤖 **AI-Ready** — JSON schema + streaming render for LLM-generated UIs
- 📱 **HiDPI** — Crisp rendering on retina displays

## Quick Start

```tsx
import { render, View, Text } from 'react-pxl';

function App() {
  return (
    <View style={{ flexDirection: 'row', padding: 20, gap: 10 }}>
      <View style={{ flex: 1, backgroundColor: '#3b82f6', padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Hello, Canvas!</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: '#10b981', padding: 16, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>No DOM here.</Text>
      </View>
    </View>
  );
}

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<App />, canvas);
```

## Architecture

```
JSX → React Reconciler → Node Tree → Yoga Layout → Canvas 2D Draw
```

## Packages

| Package | Description |
|---------|-------------|
| `@react-pxl/core` | Internal node tree, types, utilities |
| `@react-pxl/reconciler` | react-reconciler host config |
| `@react-pxl/layout` | Yoga WASM integration |
| `@react-pxl/renderer` | Canvas 2D rendering pipeline |
| `@react-pxl/events` | Hit testing, synthetic events |
| `@react-pxl/components` | Pre-built UI components |
| `@react-pxl/ai-bridge` | AI/LLM integration utilities |

## License

MIT
