import type { PxlStyle, FontWeight } from './styles';

/**
 * Runtime Tailwind-like utility class parser.
 * Parses className strings into PxlStyle objects with caching.
 *
 * Supports a practical subset of Tailwind CSS utilities:
 * - Layout: flex, flex-row, flex-col, flex-wrap, flex-1, items-*, justify-*, self-*
 * - Spacing: p-{n}, px-{n}, py-{n}, pt/pr/pb/pl-{n}, m-{n}, mx-{n}, my-{n}, gap-{n}
 * - Sizing: w-{n}, h-{n}, w-full, h-full, min-w-0, min-h-0
 * - Typography: text-{size}, font-bold, font-normal, text-left/center/right
 * - Colors: bg-{color}, text-{color}, border-{color}
 * - Borders: rounded, rounded-{n}, border, border-{n}
 * - Effects: shadow, shadow-{size}, opacity-{n}
 * - Position: absolute, relative, top/right/bottom/left-{n}
 * - Display: hidden, overflow-hidden, overflow-scroll
 */

const cache = new Map<string, PxlStyle>();

// Tailwind's default spacing scale (in px): class unit → px
const SPACING_SCALE: Record<string, number> = {
  '0': 0, '0.5': 2, '1': 4, '1.5': 6, '2': 8, '2.5': 10,
  '3': 12, '3.5': 14, '4': 16, '5': 20, '6': 24, '7': 28,
  '8': 32, '9': 36, '10': 40, '11': 44, '12': 48,
  '14': 56, '16': 64, '20': 80, '24': 96, '28': 112,
  '32': 128, '36': 144, '40': 160, '44': 176, '48': 192,
  '52': 208, '56': 224, '60': 240, '64': 256,
  '72': 288, '80': 320, '96': 384,
  'px': 1,
};

// Font size scale
const FONT_SIZE_SCALE: Record<string, number> = {
  'xs': 12, 'sm': 14, 'base': 16, 'lg': 18,
  'xl': 20, '2xl': 24, '3xl': 30, '4xl': 36,
  '5xl': 48, '6xl': 60, '7xl': 72, '8xl': 96, '9xl': 128,
};

// Border radius scale
const RADIUS_SCALE: Record<string, number> = {
  'none': 0, 'sm': 2, '': 4, 'md': 6, 'lg': 8,
  'xl': 12, '2xl': 16, '3xl': 24, 'full': 9999,
};

// Color palette (Tailwind default colors, subset)
const COLORS: Record<string, Record<string, string>> = {
  black:   { DEFAULT: '#000000' },
  white:   { DEFAULT: '#ffffff' },
  transparent: { DEFAULT: 'transparent' },
  slate:   { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  gray:    { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
  zinc:    { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
  neutral: { 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' },
  red:     { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  orange:  { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
  amber:   { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  yellow:  { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' },
  green:   { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
  emerald: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  teal:    { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
  cyan:    { 50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' },
  sky:     { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
  blue:    { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  indigo:  { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  violet:  { 50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  purple:  { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  fuchsia: { 50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' },
  pink:    { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
  rose:    { 50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' },
};

function resolveColor(name: string): string | undefined {
  // Direct hex
  if (name.startsWith('#') || name.startsWith('rgb')) return name;
  // Named: e.g. "white", "black", "transparent"
  if (COLORS[name]?.DEFAULT) return COLORS[name].DEFAULT;
  // Palette: e.g. "blue-500", "gray-100"
  const dashIdx = name.lastIndexOf('-');
  if (dashIdx !== -1) {
    const colorName = name.slice(0, dashIdx);
    const shade = name.slice(dashIdx + 1);
    return COLORS[colorName]?.[shade];
  }
  return undefined;
}

function spacing(value: string): number | undefined {
  return SPACING_SCALE[value];
}

function parseToken(token: string): PxlStyle | null {
  // --- Layout ---
  if (token === 'flex') return { display: 'flex' };
  if (token === 'flex-row') return { flexDirection: 'row' };
  if (token === 'flex-col') return { flexDirection: 'column' };
  if (token === 'flex-row-reverse') return { flexDirection: 'row-reverse' };
  if (token === 'flex-col-reverse') return { flexDirection: 'column-reverse' };
  if (token === 'flex-wrap') return { flexWrap: 'wrap' };
  if (token === 'flex-nowrap') return { flexWrap: 'nowrap' };
  if (token === 'flex-1') return { flex: 1 };
  if (token === 'flex-auto') return { flexGrow: 1, flexShrink: 1 };
  if (token === 'flex-none') return { flex: 0, flexGrow: 0, flexShrink: 0 };
  if (token === 'grow') return { flexGrow: 1 };
  if (token === 'grow-0') return { flexGrow: 0 };
  if (token === 'shrink') return { flexShrink: 1 };
  if (token === 'shrink-0') return { flexShrink: 0 };
  if (token === 'hidden') return { display: 'none' };

  // --- Align ---
  if (token === 'items-start') return { alignItems: 'flex-start' };
  if (token === 'items-end') return { alignItems: 'flex-end' };
  if (token === 'items-center') return { alignItems: 'center' };
  if (token === 'items-stretch') return { alignItems: 'stretch' };
  if (token === 'items-baseline') return { alignItems: 'baseline' };

  if (token === 'justify-start') return { justifyContent: 'flex-start' };
  if (token === 'justify-end') return { justifyContent: 'flex-end' };
  if (token === 'justify-center') return { justifyContent: 'center' };
  if (token === 'justify-between') return { justifyContent: 'space-between' };
  if (token === 'justify-around') return { justifyContent: 'space-around' };
  if (token === 'justify-evenly') return { justifyContent: 'space-evenly' };

  if (token === 'self-auto') return { alignSelf: 'auto' };
  if (token === 'self-start') return { alignSelf: 'flex-start' };
  if (token === 'self-end') return { alignSelf: 'flex-end' };
  if (token === 'self-center') return { alignSelf: 'center' };
  if (token === 'self-stretch') return { alignSelf: 'stretch' };

  // --- Position ---
  if (token === 'relative') return { position: 'relative' };
  if (token === 'absolute') return { position: 'absolute' };

  // --- Overflow ---
  if (token === 'overflow-hidden') return { overflow: 'hidden' };
  if (token === 'overflow-scroll') return { overflow: 'scroll' };
  if (token === 'overflow-visible') return { overflow: 'visible' };

  // --- Object-fit ---
  if (token === 'object-fill') return { objectFit: 'fill' };
  if (token === 'object-contain') return { objectFit: 'contain' };
  if (token === 'object-cover') return { objectFit: 'cover' };
  if (token === 'object-none') return { objectFit: 'none' };
  if (token === 'object-scale-down') return { objectFit: 'scale-down' };

  // --- Spacing: padding ---
  let m: RegExpMatchArray | null;

  m = token.match(/^p-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { padding: v }; }

  m = token.match(/^px-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingHorizontal: v }; }

  m = token.match(/^py-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingVertical: v }; }

  m = token.match(/^pt-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingTop: v }; }

  m = token.match(/^pr-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingRight: v }; }

  m = token.match(/^pb-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingBottom: v }; }

  m = token.match(/^pl-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { paddingLeft: v }; }

  // --- Spacing: margin ---
  m = token.match(/^m-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { margin: v }; }

  m = token.match(/^mx-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginHorizontal: v }; }

  m = token.match(/^my-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginVertical: v }; }

  m = token.match(/^mt-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginTop: v }; }

  m = token.match(/^mr-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginRight: v }; }

  m = token.match(/^mb-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginBottom: v }; }

  m = token.match(/^ml-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { marginLeft: v }; }

  // --- Gap ---
  m = token.match(/^gap-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { gap: v }; }

  m = token.match(/^gap-x-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { columnGap: v }; }

  m = token.match(/^gap-y-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { rowGap: v }; }

  // --- Sizing ---
  if (token === 'w-full') return { width: '100%' };
  if (token === 'h-full') return { height: '100%' };
  if (token === 'w-auto') return {};
  if (token === 'h-auto') return {};
  if (token === 'min-w-0') return { minWidth: 0 };
  if (token === 'min-h-0') return { minHeight: 0 };

  m = token.match(/^w-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { width: v }; }

  m = token.match(/^h-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { height: v }; }

  // --- Typography ---
  m = token.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/);
  if (m) { return { fontSize: FONT_SIZE_SCALE[m[1]] }; }

  if (token === 'font-bold') return { fontWeight: 'bold' };
  if (token === 'font-normal') return { fontWeight: 'normal' };
  if (token === 'font-light') return { fontWeight: '300' };
  if (token === 'font-medium') return { fontWeight: '500' };
  if (token === 'font-semibold') return { fontWeight: '600' };
  if (token === 'font-extrabold') return { fontWeight: '800' };
  if (token === 'italic') return { fontStyle: 'italic' };
  if (token === 'not-italic') return { fontStyle: 'normal' };
  if (token === 'text-left') return { textAlign: 'left' };
  if (token === 'text-center') return { textAlign: 'center' };
  if (token === 'text-right') return { textAlign: 'right' };

  m = token.match(/^leading-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { lineHeight: v }; }

  m = token.match(/^tracking-(.+)$/);
  if (m) {
    const trackingMap: Record<string, number> = {
      tighter: -0.8, tight: -0.4, normal: 0, wide: 0.4, wider: 0.8, widest: 1.6,
    };
    if (trackingMap[m[1]] !== undefined) return { letterSpacing: trackingMap[m[1]] };
  }

  // --- Colors ---
  m = token.match(/^bg-(.+)$/);
  if (m) { const c = resolveColor(m[1]); if (c) return { backgroundColor: c }; }

  m = token.match(/^text-(.+)$/);
  if (m && !FONT_SIZE_SCALE[m[1]] && m[1] !== 'left' && m[1] !== 'center' && m[1] !== 'right') {
    const c = resolveColor(m[1]);
    if (c) return { color: c };
  }

  m = token.match(/^border-(.+)$/);
  if (m && m[1] !== '0' && !m[1].match(/^\d/)) {
    const c = resolveColor(m[1]);
    if (c) return { borderColor: c };
  }

  // --- Borders ---
  if (token === 'border') return { borderWidth: 1 };
  if (token === 'border-0') return { borderWidth: 0 };
  if (token === 'border-2') return { borderWidth: 2 };
  if (token === 'border-4') return { borderWidth: 4 };
  if (token === 'border-8') return { borderWidth: 8 };

  m = token.match(/^rounded(?:-(.+))?$/);
  if (m) {
    const key = m[1] ?? '';
    const r = RADIUS_SCALE[key];
    if (r !== undefined) return { borderRadius: r };
  }

  // --- Shadow ---
  if (token === 'shadow-none') return { shadowColor: 'transparent', shadowBlur: 0 };
  if (token === 'shadow-sm') return { shadowColor: 'rgba(0,0,0,0.05)', shadowOffsetX: 0, shadowOffsetY: 1, shadowBlur: 2 };
  if (token === 'shadow') return { shadowColor: 'rgba(0,0,0,0.1)', shadowOffsetX: 0, shadowOffsetY: 1, shadowBlur: 3 };
  if (token === 'shadow-md') return { shadowColor: 'rgba(0,0,0,0.1)', shadowOffsetX: 0, shadowOffsetY: 4, shadowBlur: 6 };
  if (token === 'shadow-lg') return { shadowColor: 'rgba(0,0,0,0.1)', shadowOffsetX: 0, shadowOffsetY: 10, shadowBlur: 15 };
  if (token === 'shadow-xl') return { shadowColor: 'rgba(0,0,0,0.1)', shadowOffsetX: 0, shadowOffsetY: 20, shadowBlur: 25 };
  if (token === 'shadow-2xl') return { shadowColor: 'rgba(0,0,0,0.25)', shadowOffsetX: 0, shadowOffsetY: 25, shadowBlur: 50 };

  // --- Opacity ---
  m = token.match(/^opacity-(\d+)$/);
  if (m) { return { opacity: parseInt(m[1], 10) / 100 }; }

  // --- Position values ---
  m = token.match(/^top-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { top: v }; }

  m = token.match(/^right-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { right: v }; }

  m = token.match(/^bottom-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { bottom: v }; }

  m = token.match(/^left-(.+)$/);
  if (m) { const v = spacing(m[1]); if (v !== undefined) return { left: v }; }

  // Unrecognized token — ignore
  return null;
}

/**
 * Parse a Tailwind-like className string into a PxlStyle object.
 * Results are cached for performance.
 *
 * @example
 * parseTailwind('flex flex-row p-4 gap-3 bg-white rounded-lg shadow-md')
 * // → { display: 'flex', flexDirection: 'row', padding: 16, gap: 12,
 * //     backgroundColor: '#ffffff', borderRadius: 8,
 * //     shadowColor: 'rgba(0,0,0,0.1)', shadowOffsetY: 4, shadowBlur: 6 }
 */
export function parseTailwind(className: string): PxlStyle {
  if (!className) return {};

  const cached = cache.get(className);
  if (cached) return cached;

  const tokens = className.trim().split(/\s+/);
  const style: PxlStyle = {};

  for (const token of tokens) {
    const parsed = parseToken(token);
    if (parsed) {
      Object.assign(style, parsed);
    }
  }

  cache.set(className, style);
  return style;
}

/** Clear the parser cache (useful for testing) */
export function clearTailwindCache(): void {
  cache.clear();
}
