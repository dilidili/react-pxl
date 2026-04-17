/**
 * Scroll-linked per-item visual effects.
 * Pure functions — shared between react-pxl and react-window benchmarks.
 *
 * All effects are driven by normalized distance from the viewport center:
 *   distance = (itemCenter - viewportCenter) / (viewportHeight / 2)
 *   -1 at top edge, 0 at center, +1 at bottom edge
 */

export interface ActiveEffects {
  opacity: boolean;
  scale: boolean;
  parallax: boolean;
  colorShift: boolean;
}

export interface ItemEffects {
  opacity: number;
  scaleX: number;
  scaleY: number;
  offsetY: number;
  backgroundColor: string;
}

/**
 * Compute visual effects for a single item based on its position
 * relative to the scroll viewport center.
 *
 * @param itemY - Item's Y position within the scroll content (layout.y)
 * @param itemH - Item's height
 * @param scrollTop - Current scroll offset
 * @param viewportH - Scroll container viewport height
 * @param baseColor - Item's original background color (hex)
 * @param active - Which effects are enabled
 */
export function computeItemEffects(
  itemY: number,
  itemH: number,
  scrollTop: number,
  viewportH: number,
  baseColor: string,
  active: ActiveEffects,
): ItemEffects {
  const itemCenter = itemY + itemH / 2 - scrollTop;
  const viewportCenter = viewportH / 2;
  const halfViewport = viewportH / 2;

  // Normalized distance: 0 at center, ±1 at edges, >1 off-screen
  const distance = (itemCenter - viewportCenter) / halfViewport;
  const absD = Math.min(Math.abs(distance), 1);

  return {
    opacity: active.opacity ? 1 - absD * 0.6 : 1,
    scaleX: active.scale ? 1 - absD * 0.15 : 1,
    scaleY: active.scale ? 1 - absD * 0.15 : 1,
    offsetY: active.parallax ? distance * 20 : 0,
    backgroundColor: active.colorShift
      ? shiftColor(baseColor, distance * 40)
      : baseColor,
  };
}

/** Shift a hex color's hue by `degrees` */
function shiftColor(hex: string, degrees: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const [h, s, l] = rgbToHsl(r, g, b);
  const newH = ((h + degrees / 360) % 1 + 1) % 1;
  const [nr, ng, nb] = hslToRgb(newH, s, l);

  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}

function toHex(n: number): string {
  return Math.round(n * 255).toString(16).padStart(2, '0');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    hueToRgb(p, q, h + 1 / 3),
    hueToRgb(p, q, h),
    hueToRgb(p, q, h - 1 / 3),
  ];
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

/** All effects off (baseline) */
export const NO_EFFECTS: ActiveEffects = {
  opacity: false, scale: false, parallax: false, colorShift: false,
};

/** All effects on */
export const ALL_EFFECTS: ActiveEffects = {
  opacity: true, scale: true, parallax: true, colorShift: true,
};
