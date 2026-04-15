import type { PxlImageNode } from '@react-pxl/core';
import type { PxlStyle, ObjectFit } from '@react-pxl/core';

/**
 * Compute source rect and dest rect for object-fit modes.
 */
function computeObjectFit(
  fit: ObjectFit,
  imgW: number,
  imgH: number,
  boxW: number,
  boxH: number
): { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number } {
  if (fit === 'fill') {
    return { sx: 0, sy: 0, sw: imgW, sh: imgH, dx: 0, dy: 0, dw: boxW, dh: boxH };
  }

  const imgAspect = imgW / imgH;
  const boxAspect = boxW / boxH;

  if (fit === 'none') {
    // No scaling, center the image
    const dx = (boxW - imgW) / 2;
    const dy = (boxH - imgH) / 2;
    return { sx: 0, sy: 0, sw: imgW, sh: imgH, dx, dy, dw: imgW, dh: imgH };
  }

  let scale: number;
  if (fit === 'contain' || fit === 'scale-down') {
    scale = Math.min(boxW / imgW, boxH / imgH);
    if (fit === 'scale-down') scale = Math.min(scale, 1);
  } else {
    // cover
    scale = Math.max(boxW / imgW, boxH / imgH);
  }

  const scaledW = imgW * scale;
  const scaledH = imgH * scale;

  if (fit === 'cover') {
    // Crop the source to fill the box
    const visibleW = boxW / scale;
    const visibleH = boxH / scale;
    const sx = (imgW - visibleW) / 2;
    const sy = (imgH - visibleH) / 2;
    return { sx, sy, sw: visibleW, sh: visibleH, dx: 0, dy: 0, dw: boxW, dh: boxH };
  }

  // contain / scale-down: fit within box, centered
  const dx = (boxW - scaledW) / 2;
  const dy = (boxH - scaledH) / 2;
  return { sx: 0, sy: 0, sw: imgW, sh: imgH, dx, dy, dw: scaledW, dh: scaledH };
}

/**
 * Draw a loading/error placeholder rectangle.
 */
function drawPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isError: boolean
): void {
  ctx.save();
  ctx.fillStyle = isError ? '#fee2e2' : '#f3f4f6';
  ctx.fillRect(x, y, width, height);

  // Draw icon
  ctx.fillStyle = isError ? '#ef4444' : '#9ca3af';
  ctx.font = `${Math.min(width, height, 40) * 0.4}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isError ? '✕' : '⋯', x + width / 2, y + height / 2);
  ctx.restore();
}

/**
 * Draw an image to canvas within the computed layout bounds.
 * Supports object-fit modes, loading/error placeholders, and border-radius clipping.
 */
export function drawImage(
  ctx: CanvasRenderingContext2D,
  node: PxlImageNode,
  style: PxlStyle,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (width <= 0 || height <= 0) return;

  if (!node.isLoaded || !node.image) {
    drawPlaceholder(ctx, x, y, width, height, node.hasError);
    if (!node.isLoaded && !node.hasError) {
      node.load().catch(() => {});
    }
    return;
  }

  const fit: ObjectFit = style.objectFit ?? 'fill';
  const { sx, sy, sw, sh, dx, dy, dw, dh } = computeObjectFit(
    fit,
    node.naturalWidth,
    node.naturalHeight,
    width,
    height
  );

  ctx.save();

  // Clip to box bounds (handles border-radius clipping via parent drawRect path)
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  ctx.drawImage(node.image, sx, sy, sw, sh, x + dx, y + dy, dw, dh);
  ctx.restore();
}
