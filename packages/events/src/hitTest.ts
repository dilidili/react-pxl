import type { PxlAnyNode } from '@react-pxl/core';

/**
 * Hit testing: determine which PxlNode is at a given canvas coordinate.
 * Traverses the tree in reverse child order (last child = top z-order).
 */
export class HitTester {
  /**
   * Find the deepest node at point (x, y).
   * Returns null if no node is hit.
   */
  hitTest(rootNode: PxlAnyNode, x: number, y: number): PxlAnyNode | null {
    return this.hitTestNode(rootNode, x, y, 0, 0);
  }

  private hitTestNode(
    node: PxlAnyNode,
    px: number,
    py: number,
    parentX: number,
    parentY: number
  ): PxlAnyNode | null {
    const nodeX = parentX + node.layout.x;
    const nodeY = parentY + node.layout.y;
    const { width, height } = node.layout;

    // Check if point is within this node
    if (px < nodeX || px > nodeX + width || py < nodeY || py > nodeY + height) {
      return null;
    }

    // Check overflow clipping
    const style = node.props.style ?? {};
    if (style.overflow === 'hidden') {
      if (px < nodeX || px > nodeX + width || py < nodeY || py > nodeY + height) {
        return null;
      }
    }

    // Check children in reverse order (topmost first)
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = this.hitTestNode(node.children[i], px, py, nodeX, nodeY);
      if (hit) return hit;
    }

    // This node is the deepest hit
    return node;
  }

  /**
   * Get the full path from root to the hit node (for event bubbling).
   */
  getPath(node: PxlAnyNode): PxlAnyNode[] {
    const path: PxlAnyNode[] = [];
    let current: PxlAnyNode | null = node;
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    return path;
  }
}
