import type { PxlImageNode } from '@react-pxl/core';

/**
 * Draw an image to canvas within the computed layout bounds.
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  node: PxlImageNode,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (!node.isLoaded || !node.image) {
    // Start loading if not yet started
    node.load().catch(() => {
      // Loading failed — could render a placeholder here
    });
    return;
  }

  ctx.save();
  ctx.drawImage(node.image, x, y, width, height);
  ctx.restore();
}
