import { describe, it, expect, vi } from 'vitest';
import { PxlNode } from '@react-pxl/core';
import { ScrollManager } from '../scrollManager';

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
});
