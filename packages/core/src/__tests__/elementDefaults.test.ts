import { describe, it, expect } from 'vitest';
import { getElementDefaults, mergeStyles, TEXT_NODE_ELEMENTS, IMAGE_ELEMENTS } from '../index';

describe('elementDefaults', () => {
  describe('getElementDefaults', () => {
    it('should return defaults for div', () => {
      const s = getElementDefaults('div');
      expect(s.display).toBe('flex');
      expect(s.flexDirection).toBe('column');
    });

    it('should return heading defaults', () => {
      const h1 = getElementDefaults('h1');
      expect(h1.fontSize).toBe(32);
      expect(h1.fontWeight).toBe('bold');
      expect(h1.marginBottom).toBe(12);

      const h3 = getElementDefaults('h3');
      expect(h3.fontSize).toBe(20);
    });

    it('should return paragraph defaults', () => {
      const p = getElementDefaults('p');
      expect(p.marginBottom).toBe(16);
    });

    it('should return button defaults', () => {
      const btn = getElementDefaults('button');
      expect(btn.borderWidth).toBe(1);
      expect(btn.borderRadius).toBe(4);
      expect(btn.alignItems).toBe('center');
    });

    it('should return block base for unknown elements', () => {
      const s = getElementDefaults('custom-thing');
      expect(s.display).toBe('flex');
      expect(s.flexDirection).toBe('column');
    });
  });

  describe('mergeStyles', () => {
    it('should merge in correct order: defaults ← className ← inline', () => {
      const result = mergeStyles(
        { fontSize: 32, fontWeight: 'bold', marginBottom: 12 },
        { backgroundColor: '#fff', marginBottom: 0 },
        { color: '#333', marginBottom: 8 }
      );
      expect(result.fontSize).toBe(32);         // from defaults
      expect(result.backgroundColor).toBe('#fff'); // from className
      expect(result.color).toBe('#333');         // from inline
      expect(result.marginBottom).toBe(8);       // inline wins
    });

    it('should handle undefined inline style', () => {
      const result = mergeStyles(
        { fontSize: 16 },
        { padding: 10 },
        undefined
      );
      expect(result.fontSize).toBe(16);
      expect(result.padding).toBe(10);
    });
  });

  describe('element sets', () => {
    it('should classify text elements correctly', () => {
      expect(TEXT_NODE_ELEMENTS.has('p')).toBe(true);
      expect(TEXT_NODE_ELEMENTS.has('h1')).toBe(true);
      expect(TEXT_NODE_ELEMENTS.has('span')).toBe(true);
      expect(TEXT_NODE_ELEMENTS.has('div')).toBe(false);
      expect(TEXT_NODE_ELEMENTS.has('img')).toBe(false);
    });

    it('should classify image elements', () => {
      expect(IMAGE_ELEMENTS.has('img')).toBe(true);
      expect(IMAGE_ELEMENTS.has('div')).toBe(false);
    });
  });
});
