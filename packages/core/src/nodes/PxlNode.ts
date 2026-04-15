import type { PxlNodeBase, PxlNodeProps, PxlAnyNode } from './types';
import type { ComputedLayout, PxlStyle } from '../styles';

let nextId = 1;

/** Global callback invoked when any node's dirty flag propagates to a root */
let onTreeDirtyCallback: (() => void) | null = null;

/** Register a callback for when any node tree becomes dirty (used by pipeline) */
export function setTreeDirtyCallback(cb: (() => void) | null): void {
  onTreeDirtyCallback = cb;
}

/**
 * PxlNode represents a "View" element in the canvas tree.
 * Equivalent to a <div> in DOM — a container with layout and visual styles.
 */
export class PxlNode implements PxlNodeBase {
  readonly type = 'view' as const;
  readonly id: number;
  props: PxlNodeProps;
  parent: PxlAnyNode | null = null;
  children: PxlAnyNode[] = [];
  layout: ComputedLayout = { x: 0, y: 0, width: 0, height: 0 };
  dirty = true;
  yogaNode: unknown = null;

  /** Scroll offset for overflow:scroll containers */
  scrollTop = 0;
  scrollLeft = 0;

  constructor(props: PxlNodeProps = {}) {
    this.id = nextId++;
    this.props = props;
  }

  get style(): PxlStyle {
    return this.props.style ?? {};
  }

  appendChild(child: PxlAnyNode): void {
    child.parent = this;
    this.children.push(child);
    this.markDirty();
  }

  removeChild(child: PxlAnyNode): void {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
      this.markDirty();
    }
  }

  insertBefore(child: PxlAnyNode, beforeChild: PxlAnyNode): void {
    const index = this.children.indexOf(beforeChild);
    if (index !== -1) {
      child.parent = this;
      this.children.splice(index, 0, child);
      this.markDirty();
    } else {
      this.appendChild(child);
    }
  }

  updateProps(newProps: PxlNodeProps): void {
    this.props = newProps;
    this.markDirty();
  }

  markDirty(): void {
    this.dirty = true;
    if (this.parent && !this.parent.dirty) {
      this.parent.markDirty();
    } else if (!this.parent && onTreeDirtyCallback) {
      // Reached root — notify pipeline
      onTreeDirtyCallback();
    }
  }

  /** Get the absolute position by walking up the tree */
  getAbsolutePosition(): { x: number; y: number } {
    let x = this.layout.x;
    let y = this.layout.y;
    let node = this.parent;
    while (node) {
      x += node.layout.x;
      y += node.layout.y;
      node = node.parent;
    }
    return { x, y };
  }

  /** Check if a point is within this node's bounds */
  containsPoint(px: number, py: number): boolean {
    const { x, y } = this.getAbsolutePosition();
    return (
      px >= x &&
      px <= x + this.layout.width &&
      py >= y &&
      py <= y + this.layout.height
    );
  }
}
