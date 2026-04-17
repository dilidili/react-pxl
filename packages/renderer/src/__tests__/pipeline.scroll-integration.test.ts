import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PxlNode } from '@react-pxl/core';

// Mock draw functions to track which nodes get drawn
vi.mock('../drawRect', () => ({ drawRect: vi.fn() }));
vi.mock('../drawText', () => ({ drawText: vi.fn() }));
vi.mock('../drawImage', () => ({ drawImage: vi.fn() }));

import { drawRect } from '../drawRect';
import { CanvasPipeline } from '../pipeline';

/** Create a minimal mock canvas that satisfies CanvasPipeline constructor */
function createMockCanvas(): HTMLCanvasElement {
  const mockCtx = {
    save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(),
    clip: vi.fn(), clearRect: vi.fn(), scale: vi.fn(), fillRect: vi.fn(),
    fillText: vi.fn(), drawImage: vi.fn(), fillStyle: '', font: '',
    textAlign: '' as CanvasTextAlign, textBaseline: '' as CanvasTextBaseline,
    globalAlpha: 1, shadowColor: '', shadowBlur: 0, shadowOffsetX: 0,
    shadowOffsetY: 0, lineWidth: 1, strokeStyle: '', stroke: vi.fn(),
    fill: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), arcTo: vi.fn(),
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

/** Helper: create a PxlNode with layout and optional scroll/overflow */
function makeNode(
  layout: { x: number; y: number; width: number; height: number },
  opts: { overflow?: 'scroll' | 'hidden'; scrollTop?: number; scrollLeft?: number } = {},
): PxlNode {
  const node = new PxlNode({
    style: opts.overflow ? { overflow: opts.overflow } : {},
  });
  node.layout = { ...layout };
  if (opts.scrollTop !== undefined) node.scrollTop = opts.scrollTop;
  if (opts.scrollLeft !== undefined) node.scrollLeft = opts.scrollLeft;
  return node;
}

// Children use x=CHILD_X so we can distinguish them from the container (x=0)
const CHILD_X = 10;

/** Get rendered y-positions of children only (filtered by x === CHILD_X) */
function drawnChildYPositions(): number[] {
  return (drawRect as ReturnType<typeof vi.fn>).mock.calls
    .filter(([, , x]: [unknown, unknown, number]) => x === CHILD_X)
    .map(([, , , y]: [unknown, unknown, unknown, number]) => y)
    .sort((a: number, b: number) => a - b);
}

/** Map rendered y-positions back to item indices for uniform-height lists */
function toIndices(yPositions: number[], scrollTop: number, itemHeight: number): number[] {
  return yPositions.map(y => Math.round((y + scrollTop) / itemHeight));
}

describe('CanvasPipeline scroll + culling integration', () => {
  let pipeline: CanvasPipeline;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = new CanvasPipeline(createMockCanvas());
  });

  /** Create a scroll container with N equally-spaced child items */
  function createScrollList(opts: {
    itemCount: number;
    itemHeight: number;
    scrollTop?: number;
    containerWidth?: number;
    containerHeight?: number;
  }): { container: PxlNode; items: PxlNode[] } {
    const {
      itemCount, itemHeight, scrollTop = 0,
      containerWidth = 400, containerHeight = 300,
    } = opts;
    const container = makeNode(
      { x: 0, y: 0, width: containerWidth, height: containerHeight },
      { overflow: 'scroll', scrollTop },
    );
    const items: PxlNode[] = [];
    for (let i = 0; i < itemCount; i++) {
      const item = makeNode({
        x: CHILD_X,
        y: i * itemHeight,
        width: containerWidth - 2 * CHILD_X,
        height: itemHeight,
      });
      container.appendChild(item);
      items.push(item);
    }
    return { container, items };
  }

  // ── Scroll positions with uniform items ─────────────────────────────

  describe('scroll positions with uniform items (20 × 50px in 400×300)', () => {
    const ITEM_COUNT = 20;
    const ITEM_HEIGHT = 50;

    it('draws items 0–6 at scrollTop=0', () => {
      const { container } = createScrollList({ itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT });
      pipeline.render(container);

      // item 6 at y=300 touches viewport bottom → drawn (300 > 300 is false)
      // item 7 at y=350 is past viewport → culled
      const indices = toIndices(drawnChildYPositions(), 0, ITEM_HEIGHT);
      expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

    it('draws items 3–10 at scrollTop=200', () => {
      const { container } = createScrollList({
        itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT, scrollTop: 200,
      });
      pipeline.render(container);

      // item 3: childY=-50, bottom=0 → drawn (boundary)
      // item 10: childY=300 → drawn (boundary)
      const indices = toIndices(drawnChildYPositions(), 200, ITEM_HEIGHT);
      expect(indices).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('draws items 13–19 at scrollTop=700', () => {
      const { container } = createScrollList({
        itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT, scrollTop: 700,
      });
      pipeline.render(container);

      const indices = toIndices(drawnChildYPositions(), 700, ITEM_HEIGHT);
      expect(indices).toEqual([13, 14, 15, 16, 17, 18, 19]);
    });
  });

  // ── Round-trip stability ────────────────────────────────────────────

  describe('round-trip stability', () => {
    it('renders identical items after scrolling back to original position', () => {
      const { container } = createScrollList({ itemCount: 20, itemHeight: 50 });

      // Render at scrollTop=0
      pipeline.render(container);
      const firstRender = drawnChildYPositions();

      // Scroll to 500 and render
      vi.clearAllMocks();
      container.scrollTop = 500;
      pipeline.render(container);
      const secondRender = drawnChildYPositions();

      // Scroll back to 0 and render
      vi.clearAllMocks();
      container.scrollTop = 0;
      pipeline.render(container);
      const thirdRender = drawnChildYPositions();

      expect(thirdRender).toEqual(firstRender);
      expect(secondRender).not.toEqual(firstRender);
    });
  });

  // ── All items reachable ─────────────────────────────────────────────

  describe('all items reachable', () => {
    const ITEM_HEIGHT = 50;
    const ITEM_COUNT = 20;
    const CONTAINER_HEIGHT = 300;
    const MAX_SCROLL = ITEM_COUNT * ITEM_HEIGHT - CONTAINER_HEIGHT; // 700

    it('first item is drawn at scrollTop=0', () => {
      const { container } = createScrollList({ itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT });
      pipeline.render(container);

      const indices = toIndices(drawnChildYPositions(), 0, ITEM_HEIGHT);
      expect(indices).toContain(0);
    });

    it('last item is drawn at maxScrollY=700', () => {
      const { container } = createScrollList({
        itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT, scrollTop: MAX_SCROLL,
      });
      pipeline.render(container);

      const indices = toIndices(drawnChildYPositions(), MAX_SCROLL, ITEM_HEIGHT);
      expect(indices).toContain(ITEM_COUNT - 1);
    });

    it('every item is reachable by some scroll position', () => {
      const reachable = new Set<number>();
      for (let scroll = 0; scroll <= MAX_SCROLL; scroll += ITEM_HEIGHT) {
        vi.clearAllMocks();
        const { container } = createScrollList({
          itemCount: ITEM_COUNT, itemHeight: ITEM_HEIGHT, scrollTop: scroll,
        });
        pipeline.render(container);
        for (const idx of toIndices(drawnChildYPositions(), scroll, ITEM_HEIGHT)) {
          reachable.add(idx);
        }
      }
      for (let i = 0; i < ITEM_COUNT; i++) {
        expect(reachable).toContain(i);
      }
    });
  });

  // ── Variable-height items ───────────────────────────────────────────

  describe('variable-height items', () => {
    const HEIGHTS = [30, 50, 80, 40, 60, 100, 45, 35, 70, 55, 90, 25, 65, 75, 50];
    const CONTAINER_HEIGHT = 300;

    /** Compute cumulative y-positions from heights */
    function computePositions(heights: number[]): number[] {
      const pos: number[] = [0];
      for (let i = 1; i < heights.length; i++) {
        pos.push(pos[i - 1] + heights[i - 1]);
      }
      return pos;
    }

    /** Determine which indices should be visible using the same culling logic as the pipeline */
    function expectedVisibleIndices(
      positions: number[], heights: number[], scrollTop: number,
    ): number[] {
      const visible: number[] = [];
      for (let i = 0; i < positions.length; i++) {
        const childY = -scrollTop + positions[i];
        // Mirrors pipeline: childY + h < containerY  OR  childY > containerY + containerH
        if (childY + heights[i] < 0 || childY > CONTAINER_HEIGHT) continue;
        visible.push(i);
      }
      return visible;
    }

    /** Create a variable-height scroll list */
    function createVariableList(scrollTop: number): {
      container: PxlNode;
      positions: number[];
    } {
      const positions = computePositions(HEIGHTS);
      const container = makeNode(
        { x: 0, y: 0, width: 400, height: CONTAINER_HEIGHT },
        { overflow: 'scroll', scrollTop },
      );
      for (let i = 0; i < HEIGHTS.length; i++) {
        const item = makeNode({
          x: CHILD_X,
          y: positions[i],
          width: 380,
          height: HEIGHTS[i],
        });
        container.appendChild(item);
      }
      return { container, positions };
    }

    it('draws correct subset at scrollTop=0', () => {
      const { container, positions } = createVariableList(0);
      pipeline.render(container);

      const renderedYs = drawnChildYPositions();
      const visibleIndices = expectedVisibleIndices(positions, HEIGHTS, 0);
      // Items 0–5 visible (item 6 at y=360 is past viewport bottom)
      expect(visibleIndices).toEqual([0, 1, 2, 3, 4, 5]);

      const expectedYs = visibleIndices.map(i => positions[i]).sort((a, b) => a - b);
      expect(renderedYs).toEqual(expectedYs);
    });

    it('draws correct subset at scrollTop=300', () => {
      const { container, positions } = createVariableList(300);
      pipeline.render(container);

      const renderedYs = drawnChildYPositions();
      const visibleIndices = expectedVisibleIndices(positions, HEIGHTS, 300);
      // Items 5–10 visible
      expect(visibleIndices).toEqual([5, 6, 7, 8, 9, 10]);

      const expectedYs = visibleIndices
        .map(i => -300 + positions[i])
        .sort((a, b) => a - b);
      expect(renderedYs).toEqual(expectedYs);
    });

    it('draws correct subset near the end (scrollTop=570)', () => {
      // Total content = 870, maxScroll = 870 - 300 = 570
      const { container, positions } = createVariableList(570);
      pipeline.render(container);

      const renderedYs = drawnChildYPositions();
      const visibleIndices = expectedVisibleIndices(positions, HEIGHTS, 570);

      const expectedYs = visibleIndices
        .map(i => -570 + positions[i])
        .sort((a, b) => a - b);
      expect(renderedYs).toEqual(expectedYs);

      // Last item (index 14, y=820, h=50) should be visible
      expect(visibleIndices).toContain(HEIGHTS.length - 1);
    });
  });
});
