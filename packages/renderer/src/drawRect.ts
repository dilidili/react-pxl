import type { PxlStyle } from '@react-pxl/core';

/**
 * Draw a rectangle with background, borders, border-radius, and shadows.
 */
export function drawRect(
  ctx: CanvasRenderingContext2D,
  style: PxlStyle,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (width <= 0 || height <= 0) return;

  const hasBackground = !!style.backgroundColor;
  const hasBorder = !!(
    style.borderTopWidth || style.borderRightWidth ||
    style.borderBottomWidth || style.borderLeftWidth
  );
  const hasShadow = !!style.shadowColor;
  const hasRadius = !!(
    style.borderTopLeftRadius || style.borderTopRightRadius ||
    style.borderBottomLeftRadius || style.borderBottomRightRadius
  );

  if (!hasBackground && !hasBorder && !hasShadow) return;

  ctx.save();

  // Shadow
  if (hasShadow) {
    ctx.shadowColor = style.shadowColor!;
    ctx.shadowOffsetX = style.shadowOffsetX ?? 0;
    ctx.shadowOffsetY = style.shadowOffsetY ?? 0;
    ctx.shadowBlur = style.shadowBlur ?? 0;
  }

  // Build path
  if (hasRadius) {
    const tl = style.borderTopLeftRadius ?? 0;
    const tr = style.borderTopRightRadius ?? 0;
    const br = style.borderBottomRightRadius ?? 0;
    const bl = style.borderBottomLeftRadius ?? 0;
    roundedRect(ctx, x, y, width, height, tl, tr, br, bl);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
  }

  // Fill background
  if (hasBackground) {
    ctx.fillStyle = style.backgroundColor!;
    ctx.fill();
  }

  // Reset shadow before borders
  if (hasShadow) {
    ctx.shadowColor = 'transparent';
  }

  // Draw borders
  if (hasBorder) {
    const bw = style.borderTopWidth ?? style.borderRightWidth ?? style.borderBottomWidth ?? style.borderLeftWidth ?? 1;
    const bc = style.borderTopColor ?? style.borderRightColor ?? style.borderBottomColor ?? style.borderLeftColor ?? '#000';

    // Simple case: uniform border
    ctx.lineWidth = bw;
    ctx.strokeStyle = bc;
    ctx.stroke();
  }

  ctx.restore();
}

/** Draw a rounded rectangle path */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.arcTo(x + w, y, x + w, y + tr, tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
  ctx.lineTo(x + bl, y + h);
  ctx.arcTo(x, y + h, x, y + h - bl, bl);
  ctx.lineTo(x, y + tl);
  ctx.arcTo(x, y, x + tl, y, tl);
  ctx.closePath();
}
