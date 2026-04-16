# Package: @react-pxl/events

> Event system — hit testing, synthetic events, focus, scroll, cursor.

## Purpose

Bridges DOM events on the canvas element to React-style synthetic events dispatched to PxlNodes. Handles hit testing, event bubbling, focus management, scroll with momentum, and cursor updates.

## Exports

| Symbol | Kind | Description |
|--------|------|-------------|
| `EventDispatcher` | class | Main bridge: listens to canvas DOM events, dispatches to nodes |
| `HitTester` | class | Point-in-rect tree traversal (reverse z-order, scroll-offset aware) |
| `PxlSyntheticEvent` | class | DOM-like event object with `canvasX/Y`, `stopPropagation()` |
| `FocusManager` | class | Focus state, tabIndex, Tab/Shift+Tab navigation |
| `ScrollManager` | class | Scroll offset tracking, clamping, momentum via popmotion |
| `CursorManager` | class | Updates canvas CSS cursor based on hovered node |

## Key Design

**Event flow:**
```
Canvas DOM event → EventDispatcher → HitTester.hitTest() → find target node
  → build bubbling path (target → root)
  → call node.props.onXxx(PxlSyntheticEvent) at each node
  → FocusManager / ScrollManager / CursorManager side-effects
  → markDirty() → pipeline re-renders
```

**Supported events:**
- Pointer: `onClick`, `onPointerDown/Up/Move`, `onPointerEnter/Leave`
- Keyboard: `onKeyDown`, `onKeyUp` (dispatched to focused node)
- Focus: `onFocus`, `onBlur`
- Scroll: `onScroll` (wheel events on scroll containers)

**Scroll momentum** — uses `popmotion.decay()` for inertial scrolling after wheel/drag release.

**Focus navigation** — `FocusManager.getNextFocusable()` collects focusable nodes (tabIndex ≥ 0 or has handlers), orders by tabIndex then tree position.

## Files

```
src/
  dispatcher.ts    — EventDispatcher: pointer/keyboard/wheel listeners, event routing
  hitTest.ts       — HitTester: DFS reverse-order traversal, scroll-offset aware
  synthetic.ts     — PxlSyntheticEvent: type, target, clientX/Y, canvasX/Y, propagation control
  focusManager.ts  — Focus state, Tab navigation, focus/blur event firing
  scrollManager.ts — Scroll offset, clamping, momentum animation
  cursorManager.ts — CSS cursor updates (pointer/text/default)
```

## Dependencies

`@react-pxl/core`, `popmotion`
