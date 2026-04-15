import { describe, it, expect } from 'vitest';
import { HitTester } from '../hitTest';
import { PxlNode } from '@react-pxl/core';

describe('HitTester', () => {
  it('should hit a root node', () => {
    const tester = new HitTester();
    const root = new PxlNode();
    root.layout = { x: 0, y: 0, width: 100, height: 100 };

    const result = tester.hitTest(root, 50, 50);
    expect(result).toBe(root);
  });

  it('should miss when outside bounds', () => {
    const tester = new HitTester();
    const root = new PxlNode();
    root.layout = { x: 0, y: 0, width: 100, height: 100 };

    const result = tester.hitTest(root, 150, 150);
    expect(result).toBeNull();
  });

  it('should hit the deepest child', () => {
    const tester = new HitTester();
    const root = new PxlNode();
    root.layout = { x: 0, y: 0, width: 200, height: 200 };

    const child = new PxlNode();
    child.layout = { x: 10, y: 10, width: 50, height: 50 };
    root.appendChild(child);

    const grandchild = new PxlNode();
    grandchild.layout = { x: 5, y: 5, width: 20, height: 20 };
    child.appendChild(grandchild);

    const result = tester.hitTest(root, 20, 20);
    expect(result).toBe(grandchild);
  });

  it('should prefer last child (higher z-order)', () => {
    const tester = new HitTester();
    const root = new PxlNode();
    root.layout = { x: 0, y: 0, width: 200, height: 200 };

    const child1 = new PxlNode();
    child1.layout = { x: 10, y: 10, width: 80, height: 80 };
    root.appendChild(child1);

    const child2 = new PxlNode();
    child2.layout = { x: 10, y: 10, width: 80, height: 80 };
    root.appendChild(child2);

    const result = tester.hitTest(root, 50, 50);
    expect(result).toBe(child2);
  });

  it('should return correct path from root to target', () => {
    const tester = new HitTester();
    const root = new PxlNode();
    const child = new PxlNode();
    const grandchild = new PxlNode();

    root.appendChild(child);
    child.appendChild(grandchild);

    const path = tester.getPath(grandchild);
    expect(path).toEqual([root, child, grandchild]);
  });
});
