import type { PxlStyle } from './styles';
import { resolveStyle } from './styles';

/**
 * Default styles for HTML elements, mimicking browser UA stylesheet.
 * These are applied as the base layer before className and inline styles.
 */

const BLOCK_BASE: PxlStyle = {
  display: 'flex',
  flexDirection: 'column',
};

export const ELEMENT_DEFAULTS: Record<string, PxlStyle> = {
  // Containers (flex column by default, like block elements)
  div:     { ...BLOCK_BASE },
  section: { ...BLOCK_BASE },
  article: { ...BLOCK_BASE },
  nav:     { ...BLOCK_BASE },
  aside:   { ...BLOCK_BASE },
  main:    { ...BLOCK_BASE },
  header:  { ...BLOCK_BASE },
  footer:  { ...BLOCK_BASE },

  // Headings
  h1: { ...BLOCK_BASE, fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
  h2: { ...BLOCK_BASE, fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  h3: { ...BLOCK_BASE, fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  h4: { ...BLOCK_BASE, fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  h5: { ...BLOCK_BASE, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  h6: { ...BLOCK_BASE, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },

  // Text
  p:          { ...BLOCK_BASE, marginBottom: 16 },
  blockquote: { ...BLOCK_BASE, marginBottom: 16, paddingLeft: 16, borderLeftWidth: 4, borderLeftColor: '#d1d5db' },
  span:       {},
  a:          { color: '#2563eb' },
  em:         { fontStyle: 'italic' },
  strong:     { fontWeight: 'bold' },
  small:      { fontSize: 12 },
  label:      {},

  // Interactive
  button: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    fontSize: 14,
  },

  // Media
  img: {},

  // Lists
  ul: { ...BLOCK_BASE, paddingLeft: 20, marginBottom: 16 },
  ol: { ...BLOCK_BASE, paddingLeft: 20, marginBottom: 16 },
  li: { ...BLOCK_BASE, marginBottom: 4 },
};

/** Elements that contain text content directly */
export const TEXT_ELEMENTS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'a', 'em', 'strong', 'small', 'label',
  'blockquote', 'li',
]);

/** Elements that map to PxlTextNode */
export const TEXT_NODE_ELEMENTS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'span', 'a', 'em', 'strong', 'small', 'label',
  'blockquote',
]);

/** Elements that map to PxlImageNode */
export const IMAGE_ELEMENTS = new Set(['img']);

/**
 * Get default styles for an HTML element.
 * Returns empty object for unknown elements (treated as div-like).
 */
export function getElementDefaults(tagName: string): PxlStyle {
  return ELEMENT_DEFAULTS[tagName] ?? BLOCK_BASE;
}

/**
 * Merge styles in specificity order: elementDefaults ← className ← inline style.
 * Shorthands in each layer are expanded before merging so that e.g.
 * inline `margin: 0` correctly overrides a default `marginBottom: 12`.
 */
export function mergeStyles(
  elementDefaults: PxlStyle,
  classNameStyle: PxlStyle,
  inlineStyle: PxlStyle | undefined
): PxlStyle {
  return {
    ...resolveStyle(elementDefaults),
    ...resolveStyle(classNameStyle),
    ...resolveStyle(inlineStyle ?? {}),
  };
}
