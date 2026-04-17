import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PxlNode } from '@react-pxl/core';

// Mock draw functions to track which nodes get drawn
vi.mock('../drawRect', () => ({
  drawRect: vi.fn(),
}));
vi.mock('../drawText', () => ({
  drawText: vi.fn(),
}));
vi.mock('../drawImage', () => ({
  drawImage: vi.fn(),
}));

import { drawRect } from '../drawRect';
import { CanvasPipeline } from '../pipeline';

/** Create a minimal mock canvas that satisfies CanvasPipeline constructor */
function createMockCanvas(): HTMLCanvasElement {
  const mockCtx = {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    clearRect: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
    globalAlpha: 1,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineWidth: 1,
    strokeStyle: '',
    stroke: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arcTo: vi.fn(),
    closePath: vi.fn(),
  };
  const canvas = document.createElement('canvas');
  Object.defineProperty(canvas, 'getBoundingClientRect', {
    value: () => ({ x: 0, y: 0, width: 800, height: 600, top: 0, left: 0, right: 800, bottom: 600, toJSON: () => {} }),
  });
  const origGetContext = canvas.getContext.bind(canvas);
  canvas.getContext = ((type: string, ...args: unknown[]) => {
    if (type === '2d') return mockCtx as unknown as CanvasRenderingContext2D;
    return origGetContext(type, ...args);
  }) as typeof canvas.getContext;
  return canvas;
}

/** Helper: create a PxlNode with layout and optional overflow style */
function makeNode(
  layout: { x: number; y: number; width: number; height: number },
  opts: { overflow?: 'scroll' | 'hidden'; scrollTop?: number; scrollLeft?: number; type?: string } = {},
): PxlNode {
  const node = new PxlNode({
    style: opts.overflow ? { overflow: opts.overflow } : {},
  });
  node.layout = { ...layout };
  if (opts.scrollTop !== undefined) node.scrollTop = opts.scrollTop;
  if (opts.scrollLeft !== undefined) node.scrollLeft = opts.scrollLeft;
  return node;
}

/** Collect the (x, y) positions drawRect was called with */
function drawnPositions(): Array<{ x: number; y: number }> {
  return (drawRect as ReturnType<typeof vi.fn>).mock.calls.map(
    ([, , x, y]: [unknown, unknown, number, number]) => ({ x, y }),
  );
}

describe('CanvasPipeline viewport culling', () => {
  let pipeline: CanvasPipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = new CanvasPipeline(createMockCanvas());
  });

  // ── Basic culling ──────────────────────────────────────────────────

  describe('basic culling', () => {
    it('skips child entirely above the viewport', () => {
      // Scroll container at (0,0) 400×300 with overflow:scroll
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      // Child positioned so it ends above the container viewport
      const above = makeNode({ x: 0, y: -200, width: 400, height: 100 });
      container.appendChild(above);

      pipeline.render(container);

      // drawRect is called for the container itself but NOT for the above child
      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 0, y: 0 }); // container
      expect(positions).not.toContainEqual({ x: 0, y: -200 }); // culled child
    });

    it('skips child entirely below the viewport', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      // Child starts below the container bottom
      const below = makeNode({ x: 0, y: 400, width: 400, height: 100 });
      container.appendChild(below);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 0, y: 0 });
      expect(positions).not.toContainEqual({ x: 0, y: 400 });
    });

    it('draws child inside the viewport', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const inside = makeNode({ x: 10, y: 50, width: 100, height: 100 });
      inside.props = { style: { backgroundColor: '#f00' } };
      container.appendChild(inside);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 10, y: 50 });
    });

    it('skips child entirely to the left of the viewport', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const left = makeNode({ x: -200, y: 50, width: 100, height: 100 });
      container.appendChild(left);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).not.toContainEqual({ x: -200, y: 50 });
    });

    it('skips child entirely to the right of the viewport', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const right = makeNode({ x: 500, y: 50, width: 100, height: 100 });
      container.appendChild(right);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).not.toContainEqual({ x: 500, y: 50 });
    });
  });

  // ── Boundary cases ─────────────────────────────────────────────────
  // These verify the `<` / `>` operators (not `<=` / `>=`).
  // Items exactly touching the boundary are NOT culled — changing to `<=`
  // would break these tests (and was the source of a previous bug).

  describe('boundary cases', () => {
    it('draws child whose bottom edge exactly touches viewport top', () => {
      // Container at (0,0) 400×300. childBaseY = 0.
      // Child layout y=-100 h=100 → absolute childY = -100, bottom = 0.
      // Culling check: childY + h < y → 0 < 0 → false → NOT culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const edgeChild = makeNode({ x: 0, y: -100, width: 400, height: 100 });
      container.appendChild(edgeChild);

      pipeline.render(container);

      const callCount = (drawRect as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(callCount).toBe(2); // container + boundary child
      expect(drawnPositions()).toContainEqual({ x: 0, y: -100 });
    });

    it('culls child whose bottom edge is 1px above viewport top', () => {
      // Child layout y=-101 h=100 → bottom = -1. Check: -1 < 0 → true → culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const culled = makeNode({ x: 0, y: -101, width: 400, height: 100 });
      container.appendChild(culled);

      pipeline.render(container);

      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1); // container only
    });

    it('draws child whose top edge exactly touches viewport bottom', () => {
      // Container at (0,0) 400×300. Child layout y=300 → childY = 300.
      // Check: childY > y + height → 300 > 300 → false → NOT culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const edgeChild = makeNode({ x: 0, y: 300, width: 400, height: 50 });
      container.appendChild(edgeChild);

      pipeline.render(container);

      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
      expect(drawnPositions()).toContainEqual({ x: 0, y: 300 });
    });

    it('culls child whose top edge is 1px below viewport bottom', () => {
      // Child layout y=301 → childY = 301. Check: 301 > 300 → true → culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const culled = makeNode({ x: 0, y: 301, width: 400, height: 50 });
      container.appendChild(culled);

      pipeline.render(container);

      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
    });

    it('draws child whose right edge exactly touches viewport left', () => {
      // Container at (0,0) 400×300. Child layout x=-100 w=100 → right = 0.
      // Check: childX + w < x → 0 < 0 → false → NOT culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const edgeChild = makeNode({ x: -100, y: 50, width: 100, height: 50 });
      container.appendChild(edgeChild);

      pipeline.render(container);

      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
      expect(drawnPositions()).toContainEqual({ x: -100, y: 50 });
    });

    it('draws child whose left edge exactly touches viewport right', () => {
      // Container at (0,0) 400×300. Child layout x=400 → childX = 400.
      // Check: childX > x + width → 400 > 400 → false → NOT culled.
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const edgeChild = makeNode({ x: 400, y: 50, width: 100, height: 50 });
      container.appendChild(edgeChild);

      pipeline.render(container);

      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
      expect(drawnPositions()).toContainEqual({ x: 400, y: 50 });
    });
  });

  // ── Partially visible items ────────────────────────────────────────

  describe('partially visible items', () => {
    it('draws child partially visible at the top edge', () => {
      // Container at (0,0) 400×300. Child at y=-50 h=100 → visible 50px
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const partial = makeNode({ x: 0, y: -50, width: 400, height: 100 });
      partial.props = { style: { backgroundColor: '#00f' } };
      container.appendChild(partial);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 0, y: -50 });
    });

    it('draws child partially visible at the bottom edge', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      // Child at y=250 h=100 → bottom at 350, extends 50px past viewport
      const partial = makeNode({ x: 0, y: 250, width: 400, height: 100 });
      partial.props = { style: { backgroundColor: '#00f' } };
      container.appendChild(partial);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 0, y: 250 });
    });

    it('draws child partially visible at the left edge', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const partial = makeNode({ x: -50, y: 50, width: 100, height: 100 });
      partial.props = { style: { backgroundColor: '#00f' } };
      container.appendChild(partial);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: -50, y: 50 });
    });

    it('draws child partially visible at the right edge', () => {
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 }, { overflow: 'scroll' });
      const partial = makeNode({ x: 350, y: 50, width: 100, height: 100 });
      partial.props = { style: { backgroundColor: '#00f' } };
      container.appendChild(partial);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 350, y: 50 });
    });
  });

  // ── Scroll offset ──────────────────────────────────────────────────

  describe('with scroll offset', () => {
    it('culls items scrolled out of view and draws visible ones', () => {
      // Container 400×300 at origin with scrollTop=500
      // childBaseY = 0 - 500 = -500
      const container = makeNode(
        { x: 0, y: 0, width: 400, height: 300 },
        { overflow: 'scroll', scrollTop: 500 },
      );

      // child0: layout y=0 → absolute y = -500, bottom = -400 → culled (above)
      const child0 = makeNode({ x: 0, y: 0, width: 400, height: 100 });
      // child1: layout y=450 → absolute y = -50, bottom = 50 → partially visible
      const child1 = makeNode({ x: 0, y: 450, width: 400, height: 100 });
      // child2: layout y=550 → absolute y = 50 → fully inside
      const child2 = makeNode({ x: 0, y: 550, width: 400, height: 100 });
      // child3: layout y=800 → absolute y = 300, boundary → drawn (300 > 300 is false)
      const child3 = makeNode({ x: 0, y: 800, width: 400, height: 100 });
      // child4: layout y=1000 → absolute y = 500 → culled (below)
      const child4 = makeNode({ x: 0, y: 1000, width: 400, height: 100 });

      container.appendChild(child0);
      container.appendChild(child1);
      container.appendChild(child2);
      container.appendChild(child3);
      container.appendChild(child4);

      pipeline.render(container);

      const positions = drawnPositions();

      // Container drawn at (0,0)
      expect(positions).toContainEqual({ x: 0, y: 0 });
      // child0 at y=-500: culled
      expect(positions).not.toContainEqual({ x: 0, y: -500 });
      // child1 at y=-50: drawn (partial)
      expect(positions).toContainEqual({ x: 0, y: -50 });
      // child2 at y=50: drawn
      expect(positions).toContainEqual({ x: 0, y: 50 });
      // child3 at y=300: drawn (boundary)
      expect(positions).toContainEqual({ x: 0, y: 300 });
      // child4 at y=500: culled
      expect(positions).not.toContainEqual({ x: 0, y: 500 });

      // Total: container + child1 + child2 + child3 = 4
      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(4);
    });

    it('applies horizontal scroll offset for culling', () => {
      const container = makeNode(
        { x: 0, y: 0, width: 400, height: 300 },
        { overflow: 'scroll', scrollLeft: 200 },
      );

      // Child at layout x=0 w=100 → absolute x = 0 - 200 = -200, right = -100 → culled
      const leftChild = makeNode({ x: 0, y: 50, width: 100, height: 100 });
      // Child at layout x=300 w=100 → absolute x = 300 - 200 = 100 → inside → drawn
      const midChild = makeNode({ x: 300, y: 50, width: 100, height: 100 });

      container.appendChild(leftChild);
      container.appendChild(midChild);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).not.toContainEqual({ x: -200, y: 50 });
      expect(positions).toContainEqual({ x: 100, y: 50 });
    });
  });

  // ── All items visible (no culling needed) ──────────────────────────

  describe('all items visible', () => {
    it('draws all children when container is larger than content', () => {
      const container = makeNode(
        { x: 0, y: 0, width: 800, height: 600 },
        { overflow: 'scroll' },
      );

      const children: PxlNode[] = [];
      for (let i = 0; i < 5; i++) {
        const child = makeNode({ x: 10, y: i * 50, width: 200, height: 40 });
        child.props = { style: { backgroundColor: '#abc' } };
        container.appendChild(child);
        children.push(child);
      }

      pipeline.render(container);

      const positions = drawnPositions();
      // Container + all 5 children = 6 drawRect calls
      expect((drawRect as ReturnType<typeof vi.fn>).mock.calls.length).toBe(6);
      for (let i = 0; i < 5; i++) {
        expect(positions).toContainEqual({ x: 10, y: i * 50 });
      }
    });

    it('does not cull when overflow is visible (no clipping)', () => {
      // Container without overflow:scroll/hidden → no culling at all
      const container = makeNode({ x: 0, y: 0, width: 400, height: 300 });
      // Child fully outside, but overflow=visible → should still be drawn
      const farChild = makeNode({ x: 0, y: 500, width: 400, height: 100 });
      farChild.props = { style: { backgroundColor: '#f00' } };
      container.appendChild(farChild);

      pipeline.render(container);

      const positions = drawnPositions();
      expect(positions).toContainEqual({ x: 0, y: 500 });
    });
  });
});
