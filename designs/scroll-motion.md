# Scroll & Motion System Design

> Canvas-native scroll with pointer-drag, momentum physics, and smooth wheel animation.

## Problem

The current scroll system only responds to `wheel` events. This breaks in two key scenarios:
1. **Iframe embedding** — wheel events are captured by the parent page and never reach the canvas
2. **Touch devices** — no touch/drag support at all

Additionally, scroll jumps by raw pixel deltas with no animation — feels mechanical and non-native.

## Goals

- **Pointer-drag scroll** — pointerdown→move→up drives scrolling (works everywhere: iframe, touch, mouse)
- **Momentum/decay** — releasing a drag flings the list with physics-based deceleration
- **Smooth wheel** — wheel events animate to a target instead of snapping
- **Cancel on interrupt** — any new interaction cancels the current animation
- **Zero React API changes** — `overflow: 'scroll'` continues to work as before

## Architecture

```
User gesture (wheel / pointer-drag)
  ↓
EventDispatcher
  ├─ handleWheelEvent()  → ScrollManager.animateTo(target)
  └─ handleDragScroll()  → ScrollManager.scroll(delta) during drag
                          → ScrollManager.fling(velocity) on release
  ↓
ScrollManager
  ├─ scroll()          — immediate delta (existing, used during drag)
  ├─ animateTo()       — spring animation to target offset
  └─ fling()           — decay animation with initial velocity
  ↓
popmotion.animate() / decay()
  ↓
requestAnimationFrame loop updates scrollTop → markDirty() → re-render
```

## Library Choice: `popmotion`

| Option | Size | DOM-free? | Notes |
|--------|------|-----------|-------|
| `motion` (framer-motion) | ~35KB | ❌ Needs DOM elements | Can't animate raw numbers on canvas |
| `popmotion` | ~5KB | ✅ Pure math | `animate()`, `decay()`, `spring` — works with raw values |
| Custom physics | 0KB | ✅ | More code to maintain, spring tuning is hard |

**Decision:** Use `popmotion` — minimal size, battle-tested spring/decay, zero DOM dependency.

## Detailed Design

### 1. Pointer-Drag Scrolling (EventDispatcher)

New state in `EventDispatcher`:
```typescript
private dragState: {
  active: boolean;
  scrollContainer: PxlAnyNode | null;
  lastY: number;
  lastX: number;
  lastTime: number;
  velocityY: number;
  velocityX: number;
} | null = null;
```

**Events:**
- `pointerdown` on a scroll container → start drag tracking
- `pointermove` while dragging → apply `scroll(dx, dy)` immediately, track velocity
- `pointerup` / `pointerleave` → call `fling(velocityY)` for momentum

**Velocity tracking:** Use last 3 frames of delta/time to compute average velocity (avoids jitter from single frame).

### 2. Momentum Fling (ScrollManager)

```typescript
fling(container, velocityX, velocityY): void {
  this.cancelAnimation(container);
  
  const startY = container.scrollTop;
  this.activeAnimation = decay({
    from: startY,
    velocity: velocityY,
    power: 0.8,        // deceleration rate
    timeConstant: 350,  // ms to decay
    restDelta: 0.5,     // stop when delta < 0.5px
    onUpdate: (v) => {
      const dy = v - container.scrollTop;
      this.scroll(container, 0, dy);
    },
    onComplete: () => { this.activeAnimation = null; }
  });
}
```

### 3. Smooth Wheel Scroll (ScrollManager)

Instead of `scroll(0, deltaY)` directly:

```typescript
animateTo(container, targetScrollTop): void {
  this.cancelAnimation(container);
  
  this.activeAnimation = animate({
    from: container.scrollTop,
    to: clamp(0, maxScroll, targetScrollTop),
    type: 'spring',
    stiffness: 300,
    damping: 30,
    onUpdate: (v) => {
      container.scrollTop = v;
      container.markDirty();
    }
  });
}
```

Wheel handler accumulates target: `this.wheelTarget += deltaY` then calls `animateTo(wheelTarget)`.

### 4. Animation Cancellation

Any new gesture (drag start, wheel, programmatic scroll) cancels the active animation:
```typescript
cancelAnimation(container): void {
  if (this.activeAnimation) {
    this.activeAnimation.stop();
    this.activeAnimation = null;
  }
}
```

## Files Changed

| File | Change |
|------|--------|
| `packages/events/package.json` | Add `popmotion` dependency |
| `packages/events/src/scrollManager.ts` | Add `fling()`, `animateTo()`, `cancelAnimation()` |
| `packages/events/src/dispatcher.ts` | Add pointer-drag handlers, update wheel handler |
| `packages/events/src/__tests__/scrollManager.test.ts` | Add tests for new methods |

## Testing

- Unit tests: mock `popmotion` animations, verify scroll offsets
- E2E: Playwright pointer drag on scroll demo, verify position changes
- Homepage iframe: live demo should be scrollable by dragging
