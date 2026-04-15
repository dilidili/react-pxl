import type { PxlAnyNode } from '@react-pxl/core';
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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context from canvas');
    this.ctx = ctx;
    this.dpr = window.devicePixelRatio || 1;
    this.setupHiDPI();
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

  markDirty(): void {
    this.needsRender = true;
  }

  /** Start the render loop */
  start(): void {
    const loop = () => {
      if (this.needsRender && this.rootNode) {
        this.render(this.rootNode);
        this.needsRender = false;
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
  }

  /** Render the full tree immediately */
  render(rootNode: PxlAnyNode): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.renderNode(rootNode, 0, 0);
  }

  private renderNode(node: PxlAnyNode, parentX: number, parentY: number): void {
    const x = parentX + node.layout.x;
    const y = parentY + node.layout.y;
    const { width, height } = node.layout;
    const style = node.props.style ?? {};

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
      drawImage(this.ctx, node as any, x, y, width, height);
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
}
