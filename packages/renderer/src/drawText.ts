import type { PxlTextNode } from '@react-pxl/core';

/**
 * Draw text content to canvas with word wrapping and alignment.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  node: PxlTextNode,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (!node.textContent) return;

  const style = node.props.style ?? {};

  // Draw background if present
  if (style.backgroundColor) {
    ctx.save();
    ctx.fillStyle = style.backgroundColor;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  ctx.save();
  ctx.font = node.fontString;
  ctx.fillStyle = node.color;
  ctx.textBaseline = 'top';

  const lineHeight = style.lineHeight ?? node.fontSize * 1.2;
  const letterSpacing = style.letterSpacing ?? 0;
  const textAlign = node.textAlign;

  // Word wrap
  const words = node.textContent.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > width && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Render each line
  const paddingTop = style.paddingTop ?? 0;
  const paddingLeft = style.paddingLeft ?? 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineX = x + paddingLeft;
    const lineY = y + paddingTop + i * lineHeight;

    // Alignment
    if (textAlign === 'center') {
      const lineWidth = ctx.measureText(line).width;
      lineX = x + (width - lineWidth) / 2;
    } else if (textAlign === 'right') {
      const lineWidth = ctx.measureText(line).width;
      const paddingRight = style.paddingRight ?? 0;
      lineX = x + width - lineWidth - paddingRight;
    }

    // Letter spacing
    if (letterSpacing !== 0) {
      let charX = lineX;
      for (const char of line) {
        ctx.fillText(char, charX, lineY);
        charX += ctx.measureText(char).width + letterSpacing;
      }
    } else {
      ctx.fillText(line, lineX, lineY);
    }
  }

  ctx.restore();
}
