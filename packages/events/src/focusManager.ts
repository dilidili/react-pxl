import type { PxlAnyNode } from '@react-pxl/core';
import { PxlSyntheticEvent } from './synthetic';

/**
 * Manages focus state across the PxlNode tree.
 * Supports tabIndex, focus/blur events, and Tab/Shift+Tab navigation.
 */
export class FocusManager {
  private _focusedNode: PxlAnyNode | null = null;

  get focusedNode(): PxlAnyNode | null {
    return this._focusedNode;
  }

  /** Focus a node, firing blur on the old node and focus on the new one */
  setFocus(node: PxlAnyNode | null, nativeEvent?: Event): void {
    const prev = this._focusedNode;
    if (prev === node) return;

    if (prev) {
      this._focusedNode = null;
      const handler = (prev.props as any).onBlur;
      if (handler) {
        handler(new PxlSyntheticEvent({
          type: 'onBlur',
          target: prev,
          currentTarget: prev,
          clientX: 0, clientY: 0,
          canvasX: 0, canvasY: 0,
          nativeEvent: nativeEvent ?? new Event('blur'),
        }));
      }
    }

    this._focusedNode = node;

    if (node) {
      const handler = (node.props as any).onFocus;
      if (handler) {
        handler(new PxlSyntheticEvent({
          type: 'onFocus',
          target: node,
          currentTarget: node,
          clientX: 0, clientY: 0,
          canvasX: 0, canvasY: 0,
          nativeEvent: nativeEvent ?? new Event('focus'),
        }));
      }
    }
  }

  /** Check if a node is focusable (has tabIndex or interactive handlers) */
  isFocusable(node: PxlAnyNode): boolean {
    const props = node.props;
    if (props.tabIndex !== undefined && props.tabIndex >= 0) return true;
    if (props.onClick || props.onKeyDown || props.onKeyUp) return true;
    return false;
  }

  /**
   * Collect all focusable nodes in tree order, sorted by tabIndex.
   * tabIndex=0 nodes appear in tree order; positive tabIndex nodes first.
   */
  collectFocusable(root: PxlAnyNode): PxlAnyNode[] {
    const nodes: PxlAnyNode[] = [];
    this.walkTree(root, nodes);

    // Stable sort: positive tabIndex first (ascending), then tabIndex=0/undefined in tree order
    const positive = nodes.filter(n => (n.props.tabIndex ?? 0) > 0);
    const zero = nodes.filter(n => (n.props.tabIndex ?? 0) === 0);
    positive.sort((a, b) => (a.props.tabIndex ?? 0) - (b.props.tabIndex ?? 0));
    return [...positive, ...zero];
  }

  private walkTree(node: PxlAnyNode, out: PxlAnyNode[]): void {
    if (this.isFocusable(node)) out.push(node);
    for (const child of node.children) {
      this.walkTree(child, out);
    }
  }

  /** Move focus forward (Tab) or backward (Shift+Tab) */
  moveFocus(root: PxlAnyNode, direction: 'forward' | 'backward', nativeEvent?: Event): void {
    const focusable = this.collectFocusable(root);
    if (focusable.length === 0) return;

    const currentIdx = this._focusedNode ? focusable.indexOf(this._focusedNode) : -1;

    let nextIdx: number;
    if (direction === 'forward') {
      nextIdx = currentIdx < 0 ? 0 : (currentIdx + 1) % focusable.length;
    } else {
      nextIdx = currentIdx <= 0 ? focusable.length - 1 : currentIdx - 1;
    }

    this.setFocus(focusable[nextIdx], nativeEvent);
  }
}
