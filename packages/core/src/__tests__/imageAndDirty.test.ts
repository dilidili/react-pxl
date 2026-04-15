import { describe, it, expect, vi } from 'vitest';
import { PxlNode, PxlImageNode, setTreeDirtyCallback } from '@react-pxl/core';

describe('PxlImageNode enhancements', () => {
  it('should track error state', () => {
    const img = new PxlImageNode({ src: 'bad.png' });
    expect(img.hasError).toBe(false);
    // Simulate error
    (img as any)._error = true;
    expect(img.hasError).toBe(true);
  });

  it('should track intrinsic dimensions', () => {
    const img = new PxlImageNode({ src: 'test.png' });
    expect(img.naturalWidth).toBe(0);
    expect(img.naturalHeight).toBe(0);
  });

  it('should reset error and dimensions on src change', () => {
    const img = new PxlImageNode({ src: 'a.png' });
    (img as any)._error = true;
    (img as any).naturalWidth = 800;
    (img as any).naturalHeight = 600;

    img.updateProps({ src: 'b.png' });

    expect(img.hasError).toBe(false);
    expect(img.naturalWidth).toBe(0);
    expect(img.naturalHeight).toBe(0);
  });
});

describe('setTreeDirtyCallback', () => {
  it('should call callback when root node becomes dirty', () => {
    const cb = vi.fn();
    setTreeDirtyCallback(cb);

    const root = new PxlNode();
    root.dirty = false;
    root.markDirty();

    expect(cb).toHaveBeenCalledOnce();

    setTreeDirtyCallback(null);
  });

  it('should propagate dirty up and trigger callback at root', () => {
    const root = new PxlNode();
    const child = new PxlNode();
    const grandchild = new PxlNode();
    root.appendChild(child);
    child.appendChild(grandchild);

    // Register callback AFTER tree setup
    const cb = vi.fn();
    setTreeDirtyCallback(cb);

    root.dirty = false;
    child.dirty = false;
    grandchild.dirty = false;

    grandchild.markDirty();

    expect(grandchild.dirty).toBe(true);
    expect(child.dirty).toBe(true);
    expect(root.dirty).toBe(true);
    expect(cb).toHaveBeenCalledOnce();

    setTreeDirtyCallback(null);
  });

  it('should not call callback when parent is already dirty', () => {
    const root = new PxlNode();
    const child = new PxlNode();
    root.appendChild(child);

    // Register callback AFTER tree setup
    const cb = vi.fn();
    setTreeDirtyCallback(cb);

    // Root starts dirty — propagation stops at child
    root.dirty = true;
    child.dirty = false;

    child.markDirty();

    // parent was already dirty so propagation stopped before reaching root
    expect(cb).not.toHaveBeenCalled();

    setTreeDirtyCallback(null);
  });
});
