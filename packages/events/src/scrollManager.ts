import type { PxlAnyNode } from '@react-pxl/core';
import { PxlSyntheticEvent } from './synthetic';

/**
 * Manages scroll state for overflow:scroll containers.
 * Handles wheel events and clamps scroll offsets to content bounds.
 */
export class ScrollManager {
  /**
   * Find the nearest scrollable ancestor of a node (including itself).
   * A node is scrollable if its style.overflow is 'scroll' or 'auto'.
   */
  findScrollContainer(node: PxlAnyNode): PxlAnyNode | null {
    let current: PxlAnyNode | null = node;
    while (current) {
      const overflow = current.props.style?.overflow;
      if (overflow === 'scroll') return current;
      current = current.parent;
    }
    return null;
  }

  /**
   * Apply a scroll delta to a scroll container.
   * Clamps scroll offsets to valid range based on content size vs viewport.
   * Returns true if scroll position actually changed.
   */
  scroll(container: PxlAnyNode, deltaX: number, deltaY: number, nativeEvent?: Event): boolean {
    const contentHeight = this.getContentHeight(container);
    const contentWidth = this.getContentWidth(container);
    const viewportH = container.layout.height;
    const viewportW = container.layout.width;

    const maxScrollY = Math.max(0, contentHeight - viewportH);
    const maxScrollX = Math.max(0, contentWidth - viewportW);

    const prevTop = container.scrollTop;
    const prevLeft = container.scrollLeft;

    container.scrollTop = Math.max(0, Math.min(maxScrollY, container.scrollTop + deltaY));
    container.scrollLeft = Math.max(0, Math.min(maxScrollX, container.scrollLeft + deltaX));

    const changed = container.scrollTop !== prevTop || container.scrollLeft !== prevLeft;

    if (changed) {
      container.markDirty();

      const handler = (container.props as any).onScroll;
      if (handler) {
        handler(new PxlSyntheticEvent({
          type: 'onScroll',
          target: container,
          currentTarget: container,
          clientX: 0, clientY: 0,
          canvasX: 0, canvasY: 0,
          nativeEvent: nativeEvent ?? new Event('scroll'),
        }));
      }
    }

    return changed;
  }

  /** Get total content height (sum of children layout heights + gaps) */
  private getContentHeight(node: PxlAnyNode): number {
    if (node.children.length === 0) return 0;
    let maxBottom = 0;
    for (const child of node.children) {
      maxBottom = Math.max(maxBottom, child.layout.y + child.layout.height);
    }
    return maxBottom;
  }

  /** Get total content width (sum of children layout widths) */
  private getContentWidth(node: PxlAnyNode): number {
    if (node.children.length === 0) return 0;
    let maxRight = 0;
    for (const child of node.children) {
      maxRight = Math.max(maxRight, child.layout.x + child.layout.width);
    }
    return maxRight;
  }
}
