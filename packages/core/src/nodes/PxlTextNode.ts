import { PxlNode } from './PxlNode';
import type { PxlTextProps, PxlAnyNode } from './types';

/**
 * PxlTextNode represents a text element in the canvas tree.
 * Handles text content, font properties, and text measurement.
 */
export class PxlTextNode extends PxlNode {
  override readonly type = 'text' as const;
  textContent: string;

  constructor(props: PxlTextProps = {}) {
    super(props);
    this.textContent = props.children ?? '';
  }

  override updateProps(newProps: PxlTextProps): void {
    this.textContent = newProps.children ?? '';
    super.updateProps(newProps);
  }

  get fontSize(): number {
    return this.props.style?.fontSize ?? 14;
  }

  get fontFamily(): string {
    return this.props.style?.fontFamily ?? 'system-ui, -apple-system, sans-serif';
  }

  get fontWeight(): string {
    return this.props.style?.fontWeight ?? 'normal';
  }

  get fontStyle(): string {
    return this.props.style?.fontStyle ?? 'normal';
  }

  get color(): string {
    return this.props.style?.color ?? '#000000';
  }

  get textAlign(): string {
    return this.props.style?.textAlign ?? 'left';
  }

  /** Build a CSS font string for canvas context */
  get fontString(): string {
    return `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
  }

  /**
   * Measure text width using an offscreen canvas context.
   * Used by Yoga's measure function to determine text node dimensions.
   */
  measureText(ctx: CanvasRenderingContext2D, maxWidth?: number): { width: number; height: number } {
    ctx.font = this.fontString;
    const lineHeight = this.props.style?.lineHeight ?? this.fontSize * 1.2;

    if (!maxWidth || maxWidth === Infinity) {
      const metrics = ctx.measureText(this.textContent);
      return { width: metrics.width, height: lineHeight };
    }

    // Word-wrap measurement
    const words = this.textContent.split(' ');
    let currentLine = '';
    let lineCount = 1;
    let maxLineWidth = 0;

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width);
        currentLine = word;
        lineCount++;
      } else {
        currentLine = testLine;
      }
    }

    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(currentLine).width);
    return { width: maxLineWidth, height: lineCount * lineHeight };
  }
}
