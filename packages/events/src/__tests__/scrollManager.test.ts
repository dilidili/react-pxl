import { describe, it, expect, vi } from 'vitest';
import { PxlNode } from '@react-pxl/core';
import { ScrollManager } from '../scrollManager';
import { animate, decay } from 'popmotion';

vi.mock('popmotion', () => ({
  animate: vi.fn(({ to, onUpdate, onComplete }: any) => {
    onUpdate?.(to);
    onComplete?.();
    return { stop: vi.fn() };
  }),
  decay: vi.fn(({ from, velocity, onUpdate, onComplete }: any) => {
    onUpdate?.(from + velocity * 0.1);
    onComplete?.();
    return { stop: vi.fn() };
  }),
}));

describe('ScrollManager', () => {
  function makeScrollContainer(viewportH: number, contentH: number): PxlNode {
    const container = new PxlNode({ style: { overflow: 'scroll' } });
    container.layout = { x: 0, y: 0, width: 300, height: viewportH };

    // Add children to simulate content
    const child = new PxlNode({});
    child.layout = { x: 0, y: 0, width: 300, height: contentH };
    container.appendChild(child);

    return container;
  }

  it('should find the nearest scroll container', () => {
    const sm = new ScrollManager();
    const root = new PxlNode({});
    const scrollable = new PxlNode({ style: { overflow: 'scroll' } });
    const child = new PxlNode({});
    root.appendChild(scrollable);
    scrollable.appendChild(child);

    expect(sm.findScrollContainer(child)).toBe(scrollable);
    expect(sm.findScrollContainer(root)).toBeNull();
  });

  it('should scroll within bounds', () => {
    const sm = new ScrollManager();
    const container = makeScrollContainer(200, 600);

    const changed = sm.scroll(container, 0, 100);
    expect(changed).toBe(true);
    expect(container.scrollTop).toBe(100);
  });

  it('should clamp scroll to max', () => {
    const sm = new ScrollManager();
    const container = makeScrollContainer(200, 600);

    sm.scroll(container, 0, 9999);
    expect(container.scrollTop).toBe(400); // 600 - 200
  });

  it('should clamp scroll to zero', () => {
    const sm = new ScrollManager();
    const container = makeScrollContainer(200, 600);

    sm.scroll(container, 0, -100);
    expect(container.scrollTop).toBe(0);
  });

  it('should return false when scroll does not change', () => {
    const sm = new ScrollManager();
    const container = makeScrollContainer(200, 600);

    const changed = sm.scroll(container, 0, 0);
    expect(changed).toBe(false);
  });

  it('should fire onScroll handler', () => {
    const sm = new ScrollManager();
    const onScroll = vi.fn();
    const container = new PxlNode({ style: { overflow: 'scroll' }, onScroll });
    container.layout = { x: 0, y: 0, width: 300, height: 200 };
    const child = new PxlNode({});
    child.layout = { x: 0, y: 0, width: 300, height: 600 };
    container.appendChild(child);

    sm.scroll(container, 0, 50);
    expect(onScroll).toHaveBeenCalledOnce();
    expect(onScroll.mock.calls[0][0].type).toBe('onScroll');
  });

  it('should not scroll when content fits in viewport', () => {
    const sm = new ScrollManager();
    const container = makeScrollContainer(600, 200);

    const changed = sm.scroll(container, 0, 100);
    expect(changed).toBe(false);
    expect(container.scrollTop).toBe(0);
  });

  // --- smoothWheel tests ---

  describe('smoothWheel', () => {
    it('should accumulate wheel targets across calls', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);

      sm.smoothWheel(container, 100);
      sm.smoothWheel(container, 100);

      // animate was called twice; the second call should target 200
      expect(animate).toHaveBeenCalledTimes(2);
      const secondCall = (animate as any).mock.calls[1][0];
      expect(secondCall.to).toBe(200);
    });

    it('should fire onScroll handler', () => {
      const sm = new ScrollManager();
      const onScroll = vi.fn();
      const container = new PxlNode({ style: { overflow: 'scroll' }, onScroll });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };
      const child = new PxlNode({});
      child.layout = { x: 0, y: 0, width: 300, height: 600 };
      container.appendChild(child);

      sm.smoothWheel(container, 50);
      expect(onScroll).toHaveBeenCalledOnce();
      expect(onScroll.mock.calls[0][0].type).toBe('onScroll');
    });

    it('should not accumulate debt when over-scrolling past boundaries', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600); // maxScroll = 400

      // Scroll past the top boundary many times
      for (let i = 0; i < 20; i++) {
        sm.smoothWheel(container, -100);
      }
      (animate as any).mockClear();

      // A single scroll down should immediately animate to a positive target
      sm.smoothWheel(container, 100);
      const call = (animate as any).mock.calls.at(-1)[0];
      expect(call.to).toBe(100); // not -1900 + 100 = -1800

      (animate as any).mockClear();

      // Similarly, scroll past bottom boundary
      sm.smoothWheel(container, 99999);
      for (let i = 0; i < 20; i++) {
        sm.smoothWheel(container, 100);
      }
      (animate as any).mockClear();

      // A single scroll up should immediately move from maxScroll
      sm.smoothWheel(container, -50);
      const call2 = (animate as any).mock.calls.at(-1)[0];
      expect(call2.to).toBe(350); // 400 - 50, not 400 + 2000 - 50
    });
  });

  // --- animateTo tests ---

  describe('animateTo', () => {
    it('should clamp target above maxScroll to maxScroll', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600); // maxScroll = 400

      sm.animateTo(container, 9999);

      const call = (animate as any).mock.calls.at(-1)[0];
      expect(call.to).toBe(400);
    });

    it('should clamp negative target to 0', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);

      sm.animateTo(container, -100);

      const call = (animate as any).mock.calls.at(-1)[0];
      expect(call.to).toBe(0);
    });

    it('should update scrollTop via onUpdate callback', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);

      sm.animateTo(container, 150);

      // The mock calls onUpdate(to) immediately, so scrollTop should be set
      expect(container.scrollTop).toBe(150);
    });
  });

  // --- fling tests ---

  describe('fling', () => {
    it('should ignore tiny velocities below threshold', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);
      (decay as any).mockClear();

      sm.fling(container, 30); // abs(30) < 50
      expect(decay).not.toHaveBeenCalled();
    });

    it('should start decay animation for velocity above threshold', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);
      (decay as any).mockClear();

      sm.fling(container, 500);
      expect(decay).toHaveBeenCalledOnce();
      expect((decay as any).mock.calls[0][0].velocity).toBe(500);
    });

    it('should clamp scrollTop within bounds during fling', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600); // maxScroll = 400
      // Large velocity would overshoot — mock decay returns from + velocity*0.1 = 0 + 50000*0.1 = 5000
      (decay as any).mockClear();

      sm.fling(container, 50000);

      // onUpdate clamps to maxScroll (400)
      expect(container.scrollTop).toBeLessThanOrEqual(400);
      expect(container.scrollTop).toBeGreaterThanOrEqual(0);
    });
  });

  // --- cancelAnimation tests ---

  describe('cancelAnimation', () => {
    it('should stop active animation', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);
      // Use a mock that does NOT call onComplete, so the animation stays "active"
      const stopFn = vi.fn();
      (animate as any).mockImplementationOnce(({ onUpdate }: any) => {
        onUpdate?.(100);
        // intentionally no onComplete — animation stays registered
        return { stop: stopFn };
      });

      sm.animateTo(container, 100);
      sm.cancelAnimation(container);

      expect(stopFn).toHaveBeenCalled();
    });
  });

  // --- isAnimating tests ---

  describe('isAnimating', () => {
    it('returns true while animation is active', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);
      const stopFn = vi.fn();
      (animate as any).mockImplementationOnce(({ onUpdate }: any) => {
        onUpdate?.(100);
        // Don't call onComplete — animation stays active
        return { stop: stopFn };
      });

      sm.animateTo(container, 100);
      expect(sm.isAnimating(container)).toBe(true);

      sm.cancelAnimation(container);
      expect(sm.isAnimating(container)).toBe(false);
    });
  });

  // --- resetWheelTarget tests ---

  describe('resetWheelTarget', () => {
    it('should reset accumulated target to current scrollTop', () => {
      const sm = new ScrollManager();
      const container = makeScrollContainer(200, 600);
      (animate as any).mockClear();

      sm.smoothWheel(container, 100); // target = 100
      container.scrollTop = 50; // simulate partial scroll
      sm.resetWheelTarget(container); // resets target to scrollTop (50)
      (animate as any).mockClear();

      sm.smoothWheel(container, 30); // target should be 50 + 30 = 80

      const call = (animate as any).mock.calls.at(-1)[0];
      expect(call.to).toBe(80);
    });
  });

  // --- content height / maxScrollY calculation tests ---

  describe('content height / maxScrollY calculation', () => {
    it('should clamp to maxScrollY with multiple children', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({ style: { overflow: 'scroll' } });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const positions = [
        { y: 0, h: 100 },
        { y: 100, h: 100 },
        { y: 200, h: 100 },
      ];
      for (const pos of positions) {
        const child = new PxlNode({});
        child.layout = { x: 0, y: pos.y, width: 300, height: pos.h };
        container.appendChild(child);
      }

      // contentHeight = 300, maxScrollY = 300 - 200 = 100
      sm.scroll(container, 0, 150);
      expect(container.scrollTop).toBe(100);
    });

    it('should include paddingBottom in content height', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({
        style: { overflow: 'scroll', paddingBottom: 20 },
      });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const child = new PxlNode({});
      child.layout = { x: 0, y: 0, width: 300, height: 300 };
      container.appendChild(child);

      // contentHeight = 300 + 20 = 320, maxScrollY = 120
      sm.scroll(container, 0, 150);
      expect(container.scrollTop).toBe(120);
    });

    it('should fall back to padding shorthand for paddingBottom', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({
        style: { overflow: 'scroll', padding: 15 },
      });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const child = new PxlNode({});
      child.layout = { x: 0, y: 0, width: 300, height: 300 };
      container.appendChild(child);

      // contentHeight = 300 + 15 = 315, maxScrollY = 115
      sm.scroll(container, 0, 999);
      expect(container.scrollTop).toBe(115);
    });

    it('should clamp correctly with dynamic seeded heights', () => {
      function mulberry32(seed: number) {
        return function () {
          seed |= 0;
          seed = (seed + 0x6d2b79f5) | 0;
          let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }

      const rand = mulberry32(12345);
      const heights: number[] = [];
      for (let i = 0; i < 20; i++) {
        rand(); // message selection (matches generateItems order)
        heights.push(Math.floor(rand() * 161) + 40);
      }

      const sm = new ScrollManager();
      const viewportH = 400;
      const container = new PxlNode({ style: { overflow: 'scroll' } });
      container.layout = { x: 0, y: 0, width: 300, height: viewportH };

      let yOffset = 0;
      for (const h of heights) {
        const child = new PxlNode({});
        child.layout = { x: 0, y: yOffset, width: 300, height: h };
        container.appendChild(child);
        yOffset += h;
      }

      const expectedMaxScrollY = yOffset - viewportH;

      sm.scroll(container, 0, 999999);
      expect(container.scrollTop).toBe(expectedMaxScrollY);
    });

    it('should not scroll an empty container', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({ style: { overflow: 'scroll' } });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const changed = sm.scroll(container, 0, 100);
      expect(changed).toBe(false);
      expect(container.scrollTop).toBe(0);
    });

    it('should not scroll when multi-child content fits in viewport', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({ style: { overflow: 'scroll' } });
      container.layout = { x: 0, y: 0, width: 300, height: 600 };

      for (const pos of [{ y: 0, h: 100 }, { y: 100, h: 100 }]) {
        const child = new PxlNode({});
        child.layout = { x: 0, y: pos.y, width: 300, height: pos.h };
        container.appendChild(child);
      }

      const changed = sm.scroll(container, 0, 100);
      expect(changed).toBe(false);
      expect(container.scrollTop).toBe(0);
    });
  });

  // --- content width / maxScrollX calculation tests ---

  describe('content width / maxScrollX calculation', () => {
    it('should clamp horizontal scroll with paddingRight', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({
        style: { overflow: 'scroll', paddingRight: 25 },
      });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const child = new PxlNode({});
      child.layout = { x: 0, y: 0, width: 500, height: 200 };
      container.appendChild(child);

      // contentWidth = 500 + 25 = 525, maxScrollX = 225
      sm.scroll(container, 999, 0);
      expect(container.scrollLeft).toBe(225);
    });

    it('should fall back to padding shorthand for paddingRight', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({
        style: { overflow: 'scroll', padding: 10 },
      });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const child = new PxlNode({});
      child.layout = { x: 0, y: 0, width: 400, height: 200 };
      container.appendChild(child);

      // contentWidth = 400 + 10 = 410, maxScrollX = 110
      sm.scroll(container, 999, 0);
      expect(container.scrollLeft).toBe(110);
    });

    it('should clamp horizontal scroll with multiple children', () => {
      const sm = new ScrollManager();
      const container = new PxlNode({ style: { overflow: 'scroll' } });
      container.layout = { x: 0, y: 0, width: 300, height: 200 };

      const c1 = new PxlNode({});
      c1.layout = { x: 0, y: 0, width: 200, height: 200 };
      container.appendChild(c1);
      const c2 = new PxlNode({});
      c2.layout = { x: 200, y: 0, width: 200, height: 200 };
      container.appendChild(c2);

      // contentWidth = max(200, 400) = 400, maxScrollX = 100
      sm.scroll(container, 150, 0);
      expect(container.scrollLeft).toBe(100);
    });
  });
});
