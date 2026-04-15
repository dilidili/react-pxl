import type { PxlAnyNode } from '@react-pxl/core';
import { resolveStyle, setTreeDirtyCallback } from '@react-pxl/core';
import { drawRect } from './drawRect';
import { drawText } from './drawText';
import { drawImage } from './drawImage';

/**
 * CanvasPipeline traverses the PxlNode tree and renders each node
 * to a Canvas 2D context using computed layout positions.
 */
export class CanvasPipeline {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private dpr: number;
  private animFrameId: number | null = null;
  private rootNode: PxlAnyNode | null = null;
  private needsRender = true;
  private dirtyRects: Array<{ x: number; y: number; w: number; h: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context from canvas');
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.setupHiDPI();

    // Register global dirty callback so async operations (image loads) trigger re-render
    setTreeDirtyCallback(() => this.markDirty());
  }

  private setupHiDPI(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  get width(): number {
    return this.canvas.getBoundingClientRect().width;
  }

  get height(): number {
    return this.canvas.getBoundingClientRect().height;
  }

  get context(): CanvasRenderingContext2D {
    return this.ctx;
  }

  setRootNode(node: PxlAnyNode): void {
    this.rootNode = node;
    this.markDirty();
  }

  markDirty(rect?: { x: number; y: number; w: number; h: number }): void {
    this.needsRender = true;
    if (rect) {
      this.dirtyRects.push(rect);
    }
  }

  /** Start the render loop */
  start(): void {
    const loop = () => {
      if (this.needsRender && this.rootNode) {
        this.render(this.rootNode);
        this.needsRender = false;
        this.dirtyRects = [];
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /** Stop the render loop */
  stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    setTreeDirtyCallback(null);
  }

  /** Render the full tree immediately */
  render(rootNode: PxlAnyNode): void {
    const W = this.width;
    const H = this.height;
    const rects = this.dirtyRects;

    // Use dirty-rect optimization when few small regions changed
    if (rects.length > 0 && rects.length <= 8) {
      const union = this.computeUnionRect(rects, W, H);
      // Only optimize if the dirty area is less than 60% of total canvas
      if (union.w * union.h < W * H * 0.6) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(union.x, union.y, union.w, union.h);
        this.ctx.clip();
        this.ctx.clearRect(union.x, union.y, union.w, union.h);
        this.renderNode(rootNode, 0, 0);
        this.ctx.restore();
        return;
      }
    }

    // Full render
    this.ctx.clearRect(0, 0, W, H);
    this.renderNode(rootNode, 0, 0);
  }

  private renderNode(node: PxlAnyNode, parentX: number, parentY: number): void {
    const x = parentX + node.layout.x;
    const y = parentY + node.layout.y;
    const { width, height } = node.layout;
    const style = resolveStyle(node.props.style ?? {});

    // Skip hidden nodes
    if (style.display === 'none') return;

    // Apply opacity
    const prevAlpha = this.ctx.globalAlpha;
    if (style.opacity !== undefined) {
      this.ctx.globalAlpha *= style.opacity;
    }

    // Clip if overflow hidden
    const shouldClip = style.overflow === 'hidden';
    if (shouldClip) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(x, y, width, height);
      this.ctx.clip();
    }

    // Draw the node based on its type
    if (node.type === 'text') {
      drawText(this.ctx, node as any, x, y, width, height);
    } else if (node.type === 'image') {
      drawRect(this.ctx, style, x, y, width, height);
      drawImage(this.ctx, node as any, style, x, y, width, height);
    } else {
      drawRect(this.ctx, style, x, y, width, height);
    }

    // Render children
    for (const child of node.children) {
      this.renderNode(child, x, y);
    }

    // Restore clip
    if (shouldClip) {
      this.ctx.restore();
    }

    // Restore opacity
    this.ctx.globalAlpha = prevAlpha;
  }

  /** Compute the bounding union of dirty rects, clamped to canvas */
  private computeUnionRect(
    rects: Array<{ x: number; y: number; w: number; h: number }>,
    canvasW: number,
    canvasH: number
  ): { x: number; y: number; w: number; h: number } {
    let minX = canvasW, minY = canvasH, maxX = 0, maxY = 0;
    for (const r of rects) {
      minX = Math.min(minX, r.x);
      minY = Math.min(minY, r.y);
      maxX = Math.max(maxX, r.x + r.w);
      maxY = Math.max(maxY, r.y + r.h);
    }
    // Clamp to canvas bounds with 1px margin for anti-aliasing
    minX = Math.max(0, Math.floor(minX) - 1);
    minY = Math.max(0, Math.floor(minY) - 1);
    maxX = Math.min(canvasW, Math.ceil(maxX) + 1);
    maxY = Math.min(canvasH, Math.ceil(maxY) + 1);
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }
}
