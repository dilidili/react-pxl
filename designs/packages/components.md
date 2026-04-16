# Package: @react-pxl/components

> Pre-built React component primitives for explicit canvas control.

## Purpose

Thin React wrappers around the custom JSX intrinsic elements (`pxl-view`, `pxl-text`, `pxl-image`). Use these when you want explicit control instead of HTML element mapping.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `View` | component | Container (maps to `pxl-view` → `PxlNode`) |
| `Text` | component | Text content (maps to `pxl-text` → `PxlTextNode`) |
| `Image` | component | Image (maps to `pxl-image` → `PxlImageNode`) |
| `ViewProps` | type | Props for View |
| `TextProps` | type | Props for Text |
| `ImageProps` | type | Props for Image (includes `src`, `alt`) |

## Usage

```tsx
import { View, Text, Image } from '@react-pxl/components'

<View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
  <Image src="avatar.png" style={{ width: 40, height: 40, borderRadius: 20 }} />
  <Text style={{ fontSize: 16, color: '#1e293b' }}>Hello, Canvas!</Text>
</View>
```

Most users can just use HTML elements (`<div>`, `<span>`, `<img>`) — these components are for React Native-style explicit control.

## Files

```
src/
  View.tsx  — React.FC wrapping <pxl-view>
  Text.tsx  — React.FC wrapping <pxl-text>
  Image.tsx — React.FC wrapping <pxl-image>
```

## Dependencies

`@react-pxl/core`, `@react-pxl/events`, `react`
