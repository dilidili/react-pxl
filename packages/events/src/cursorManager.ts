import type { PxlAnyNode } from '@react-pxl/core';

type CursorType = 'default' | 'pointer' | 'text' | 'grab' | 'grabbing' | 'not-allowed' | 'move' | 'crosshair';

/**
 * Manages the canvas element's CSS cursor based on the hovered PxlNode.
 * Infers cursor from node type and event handlers.
 */
export class CursorManager {
  private canvas: HTMLCanvasElement;
  private currentCursor: CursorType = 'default';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  /** Update cursor based on the currently hovered node */
  update(node: PxlAnyNode | null): void {
    const cursor = this.resolveCursor(node);
    if (cursor !== this.currentCursor) {
      this.currentCursor = cursor;
      this.canvas.style.cursor = cursor;
    }
  }

  /** Determine the appropriate cursor for a node */
  private resolveCursor(node: PxlAnyNode | null): CursorType {
    if (!node) return 'default';

    // Explicit cursor in style
    const styleCursor = (node.props.style as any)?.cursor;
    if (styleCursor) return styleCursor;

    // Text nodes → text cursor
    if (node.type === 'text') return 'text';

    // Clickable nodes → pointer
    if (node.props.onClick || node.props.onPointerDown) return 'pointer';

    return 'default';
  }

  /** Reset cursor to default */
  reset(): void {
    this.currentCursor = 'default';
    this.canvas.style.cursor = 'default';
  }
}
