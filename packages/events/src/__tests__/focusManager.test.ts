import { describe, it, expect, vi } from 'vitest';
import { PxlNode } from '@react-pxl/core';
import { FocusManager } from '../focusManager';

describe('FocusManager', () => {
  it('should start with no focused node', () => {
    const fm = new FocusManager();
    expect(fm.focusedNode).toBeNull();
  });

  it('should focus a node and fire onFocus', () => {
    const fm = new FocusManager();
    const onFocus = vi.fn();
    const node = new PxlNode({ tabIndex: 0, onFocus });

    fm.setFocus(node);

    expect(fm.focusedNode).toBe(node);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onFocus.mock.calls[0][0].type).toBe('onFocus');
  });

  it('should fire onBlur when focus moves away', () => {
    const fm = new FocusManager();
    const onBlur = vi.fn();
    const nodeA = new PxlNode({ tabIndex: 0, onBlur });
    const nodeB = new PxlNode({ tabIndex: 0 });

    fm.setFocus(nodeA);
    fm.setFocus(nodeB);

    expect(fm.focusedNode).toBe(nodeB);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(onBlur.mock.calls[0][0].type).toBe('onBlur');
  });

  it('should not re-fire if focusing the same node', () => {
    const fm = new FocusManager();
    const onFocus = vi.fn();
    const node = new PxlNode({ tabIndex: 0, onFocus });

    fm.setFocus(node);
    fm.setFocus(node);

    expect(onFocus).toHaveBeenCalledOnce();
  });

  it('should identify focusable nodes', () => {
    const fm = new FocusManager();
    const focusable = new PxlNode({ tabIndex: 0 });
    const clickable = new PxlNode({ onClick: () => {} });
    const notFocusable = new PxlNode({});
    const negative = new PxlNode({ tabIndex: -1 });

    expect(fm.isFocusable(focusable)).toBe(true);
    expect(fm.isFocusable(clickable)).toBe(true);
    expect(fm.isFocusable(notFocusable)).toBe(false);
    expect(fm.isFocusable(negative)).toBe(false);
  });

  it('should collect focusable nodes in tree order', () => {
    const fm = new FocusManager();
    const root = new PxlNode({});
    const a = new PxlNode({ tabIndex: 0 });
    const b = new PxlNode({ tabIndex: 0 });
    const c = new PxlNode({ tabIndex: 0 });
    root.appendChild(a);
    root.appendChild(b);
    root.appendChild(c);

    const result = fm.collectFocusable(root);
    expect(result).toEqual([a, b, c]);
  });

  it('should sort positive tabIndex before zero', () => {
    const fm = new FocusManager();
    const root = new PxlNode({});
    const a = new PxlNode({ tabIndex: 0 });
    const b = new PxlNode({ tabIndex: 2 });
    const c = new PxlNode({ tabIndex: 1 });
    root.appendChild(a);
    root.appendChild(b);
    root.appendChild(c);

    const result = fm.collectFocusable(root);
    expect(result).toEqual([c, b, a]); // tabIndex 1, 2, then 0
  });

  it('should move focus forward with moveFocus', () => {
    const fm = new FocusManager();
    const root = new PxlNode({});
    const a = new PxlNode({ tabIndex: 0 });
    const b = new PxlNode({ tabIndex: 0 });
    const c = new PxlNode({ tabIndex: 0 });
    root.appendChild(a);
    root.appendChild(b);
    root.appendChild(c);

    fm.moveFocus(root, 'forward');
    expect(fm.focusedNode).toBe(a);

    fm.moveFocus(root, 'forward');
    expect(fm.focusedNode).toBe(b);

    fm.moveFocus(root, 'forward');
    expect(fm.focusedNode).toBe(c);

    // Wrap around
    fm.moveFocus(root, 'forward');
    expect(fm.focusedNode).toBe(a);
  });

  it('should move focus backward', () => {
    const fm = new FocusManager();
    const root = new PxlNode({});
    const a = new PxlNode({ tabIndex: 0 });
    const b = new PxlNode({ tabIndex: 0 });
    root.appendChild(a);
    root.appendChild(b);

    // First backward from nothing → last element
    fm.moveFocus(root, 'backward');
    expect(fm.focusedNode).toBe(b);

    fm.moveFocus(root, 'backward');
    expect(fm.focusedNode).toBe(a);

    // Wrap around
    fm.moveFocus(root, 'backward');
    expect(fm.focusedNode).toBe(b);
  });
});
