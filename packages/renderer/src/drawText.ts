import type { PxlTextNode } from '@react-pxl/core';
import { resolveStyle } from '@react-pxl/core';

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

  const style = resolveStyle(node.props.style ?? {});

  // Draw background + border radius for text containers
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

  // Padding is handled by Yoga for child positioning, but text nodes
  // need to respect their own padding for text inset
  const pt = style.paddingTop ?? 0;
  const pr = style.paddingRight ?? 0;
  const pl = style.paddingLeft ?? 0;

  // Available width for text wrapping (subtract padding from layout width)
  const textAreaWidth = width - pl - pr;

  // Word wrap within available width
  const words = node.textContent.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > textAreaWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Render each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineX = x + pl;
    const lineY = y + pt + i * lineHeight;

    // Alignment
    if (textAlign === 'center') {
      const lineWidth = ctx.measureText(line).width;
      lineX = x + (width - lineWidth) / 2;
    } else if (textAlign === 'right') {
      const lineWidth = ctx.measureText(line).width;
      lineX = x + width - lineWidth - pr;
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
