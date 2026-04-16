import { PxlNode } from './PxlNode';
import type { PxlTextProps, PxlAnyNode } from './types';

/**
 * PxlTextNode represents a text element in the canvas tree.
 * Handles text content, font properties, and text measurement.
 *
 * Text-related CSS properties (color, fontSize, fontFamily, fontWeight,
 * fontStyle, lineHeight, textAlign) inherit from ancestors when not
 * explicitly set — matching DOM/CSS inheritance behaviour.
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

  /** Walk ancestor chain looking for an inherited style value */
  private inheritStyle<K extends string>(prop: K): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let node: PxlNode | null = this.parent as PxlNode | null;
    while (node) {
      const val = (node.props.style as any)?.[prop];
      if (val !== undefined) return val;
      node = node.parent as PxlNode | null;
    }
    return undefined;
  }

  get fontSize(): number {
    return this.props.style?.fontSize ?? this.inheritStyle('fontSize') ?? 14;
  }

  get fontFamily(): string {
    return this.props.style?.fontFamily ?? this.inheritStyle('fontFamily') ?? 'system-ui, -apple-system, sans-serif';
  }

  get fontWeight(): string {
    return this.props.style?.fontWeight ?? this.inheritStyle('fontWeight') ?? 'normal';
  }

  get fontStyle(): string {
    return this.props.style?.fontStyle ?? this.inheritStyle('fontStyle') ?? 'normal';
  }

  get color(): string {
    return this.props.style?.color ?? this.inheritStyle('color') ?? '#000000';
  }

  get textAlign(): string {
    return this.props.style?.textAlign ?? this.inheritStyle('textAlign') ?? 'left';
  }

  /** Resolve lineHeight: unitless values < 5 are treated as em multipliers (CSS behaviour) */
  get resolvedLineHeight(): number {
    const raw = this.props.style?.lineHeight ?? this.inheritStyle('lineHeight');
    if (raw === undefined) return this.fontSize * 1.2;
    if (typeof raw === 'number' && raw > 0 && raw < 5) return raw * this.fontSize;
    return raw;
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
    const lineHeight = this.resolvedLineHeight;

    if (!maxWidth || maxWidth === Infinity) {
      const metrics = ctx.measureText(this.textContent);
      return { width: metrics.width, height: lineHeight };
    }

    const lines = wrapText(ctx, this.textContent, maxWidth);
    let maxLineWidth = 0;
    for (const line of lines) {
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
    }
    return { width: maxLineWidth, height: lines.length * lineHeight };
  }
}

/**
 * Word-wrap text to fit within maxWidth.
 * Falls back to character-level breaking when a single word exceeds the width.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width <= maxWidth || !currentLine) {
      // Fits, or it's the first word on the line (handle below)
      if (!currentLine && ctx.measureText(word).width > maxWidth) {
        // Single word exceeds maxWidth — break at character level
        let partial = '';
        for (const ch of word) {
          if (partial && ctx.measureText(partial + ch).width > maxWidth) {
            lines.push(partial);
            partial = ch;
          } else {
            partial += ch;
          }
        }
        currentLine = partial;
      } else {
        currentLine = testLine;
      }
    } else {
      lines.push(currentLine);
      // Start new line; check if the word itself exceeds maxWidth
      if (ctx.measureText(word).width > maxWidth) {
        let partial = '';
        for (const ch of word) {
          if (partial && ctx.measureText(partial + ch).width > maxWidth) {
            lines.push(partial);
            partial = ch;
          } else {
            partial += ch;
          }
        }
        currentLine = partial;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
