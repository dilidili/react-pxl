import { describe, it, expect, vi } from 'vitest';
import { PxlNode, PxlTextNode } from '@react-pxl/core';
import { CursorManager } from '../cursorManager';

describe('CursorManager', () => {
  function mockCanvas() {
    return { style: { cursor: '' } } as unknown as HTMLCanvasElement;
  }

  it('should set default cursor for null node', () => {
    const canvas = mockCanvas();
    const cm = new CursorManager(canvas);
    // First set a non-default cursor
    const node = new PxlNode({ onClick: () => {} });
    cm.update(node);
    expect(canvas.style.cursor).toBe('pointer');
    // Then update to null → should revert to default
    cm.update(null);
    expect(canvas.style.cursor).toBe('default');
  });

  it('should set pointer cursor for clickable nodes', () => {
    const canvas = mockCanvas();
    const cm = new CursorManager(canvas);
    const node = new PxlNode({ onClick: () => {} });
    cm.update(node);
    expect(canvas.style.cursor).toBe('pointer');
  });

  it('should set text cursor for text nodes', () => {
    const canvas = mockCanvas();
    const cm = new CursorManager(canvas);
    const node = new PxlTextNode({ children: 'hello' });
    cm.update(node);
    expect(canvas.style.cursor).toBe('text');
  });

  it('should not re-set cursor if unchanged', () => {
    const canvas = mockCanvas();
    const cm = new CursorManager(canvas);
    const node = new PxlNode({ onClick: () => {} });

    cm.update(node);
    expect(canvas.style.cursor).toBe('pointer');
    // Second call with same cursor type → no assignment
    cm.update(node);
    expect(canvas.style.cursor).toBe('pointer');
  });

  it('should reset cursor', () => {
    const canvas = mockCanvas();
    const cm = new CursorManager(canvas);
    const node = new PxlNode({ onClick: () => {} });
    cm.update(node);
    cm.reset();
    expect(canvas.style.cursor).toBe('default');
  });
});
