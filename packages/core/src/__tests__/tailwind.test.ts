import { describe, it, expect, beforeEach } from 'vitest';
import { parseTailwind, clearTailwindCache } from '../index';

beforeEach(() => clearTailwindCache());

describe('parseTailwind', () => {
  describe('layout', () => {
    it('should parse flex utilities', () => {
      expect(parseTailwind('flex')).toEqual({ display: 'flex' });
      expect(parseTailwind('flex-row')).toEqual({ flexDirection: 'row' });
      expect(parseTailwind('flex-col')).toEqual({ flexDirection: 'column' });
      expect(parseTailwind('flex-1')).toEqual({ flex: 1 });
      expect(parseTailwind('flex-wrap')).toEqual({ flexWrap: 'wrap' });
    });

    it('should parse alignment', () => {
      expect(parseTailwind('items-center')).toEqual({ alignItems: 'center' });
      expect(parseTailwind('justify-between')).toEqual({ justifyContent: 'space-between' });
      expect(parseTailwind('self-start')).toEqual({ alignSelf: 'flex-start' });
    });

    it('should parse hidden', () => {
      expect(parseTailwind('hidden')).toEqual({ display: 'none' });
    });
  });

  describe('spacing', () => {
    it('should parse padding', () => {
      expect(parseTailwind('p-4')).toEqual({ padding: 16 });
      expect(parseTailwind('px-2')).toEqual({ paddingHorizontal: 8 });
      expect(parseTailwind('py-3')).toEqual({ paddingVertical: 12 });
      expect(parseTailwind('pt-1')).toEqual({ paddingTop: 4 });
      expect(parseTailwind('p-0')).toEqual({ padding: 0 });
    });

    it('should parse margin', () => {
      expect(parseTailwind('m-4')).toEqual({ margin: 16 });
      expect(parseTailwind('mx-2')).toEqual({ marginHorizontal: 8 });
      expect(parseTailwind('my-3')).toEqual({ marginVertical: 12 });
      expect(parseTailwind('mb-6')).toEqual({ marginBottom: 24 });
    });

    it('should parse gap', () => {
      expect(parseTailwind('gap-3')).toEqual({ gap: 12 });
      expect(parseTailwind('gap-x-2')).toEqual({ columnGap: 8 });
      expect(parseTailwind('gap-y-4')).toEqual({ rowGap: 16 });
    });
  });

  describe('sizing', () => {
    it('should parse width and height', () => {
      expect(parseTailwind('w-full')).toEqual({ width: '100%' });
      expect(parseTailwind('h-full')).toEqual({ height: '100%' });
      expect(parseTailwind('w-10')).toEqual({ width: 40 });
      expect(parseTailwind('h-8')).toEqual({ height: 32 });
    });
  });

  describe('typography', () => {
    it('should parse font size', () => {
      expect(parseTailwind('text-sm')).toEqual({ fontSize: 14 });
      expect(parseTailwind('text-xl')).toEqual({ fontSize: 20 });
      expect(parseTailwind('text-2xl')).toEqual({ fontSize: 24 });
    });

    it('should parse font weight', () => {
      expect(parseTailwind('font-bold')).toEqual({ fontWeight: 'bold' });
      expect(parseTailwind('font-semibold')).toEqual({ fontWeight: '600' });
      expect(parseTailwind('font-normal')).toEqual({ fontWeight: 'normal' });
    });

    it('should parse text align', () => {
      expect(parseTailwind('text-center')).toEqual({ textAlign: 'center' });
      expect(parseTailwind('text-right')).toEqual({ textAlign: 'right' });
    });
  });

  describe('colors', () => {
    it('should parse background colors', () => {
      expect(parseTailwind('bg-white')).toEqual({ backgroundColor: '#ffffff' });
      expect(parseTailwind('bg-black')).toEqual({ backgroundColor: '#000000' });
      expect(parseTailwind('bg-blue-500')).toEqual({ backgroundColor: '#3b82f6' });
      expect(parseTailwind('bg-gray-100')).toEqual({ backgroundColor: '#f3f4f6' });
    });

    it('should parse text colors', () => {
      expect(parseTailwind('text-white')).toEqual({ color: '#ffffff' });
      expect(parseTailwind('text-gray-800')).toEqual({ color: '#1f2937' });
      expect(parseTailwind('text-red-500')).toEqual({ color: '#ef4444' });
    });

    it('should parse border colors', () => {
      expect(parseTailwind('border-gray-300')).toEqual({ borderColor: '#d1d5db' });
    });
  });

  describe('borders', () => {
    it('should parse border width', () => {
      expect(parseTailwind('border')).toEqual({ borderWidth: 1 });
      expect(parseTailwind('border-2')).toEqual({ borderWidth: 2 });
      expect(parseTailwind('border-0')).toEqual({ borderWidth: 0 });
    });

    it('should parse border radius', () => {
      expect(parseTailwind('rounded')).toEqual({ borderRadius: 4 });
      expect(parseTailwind('rounded-lg')).toEqual({ borderRadius: 8 });
      expect(parseTailwind('rounded-full')).toEqual({ borderRadius: 9999 });
      expect(parseTailwind('rounded-none')).toEqual({ borderRadius: 0 });
    });
  });

  describe('effects', () => {
    it('should parse shadows', () => {
      const s = parseTailwind('shadow-md');
      expect(s.shadowColor).toBe('rgba(0,0,0,0.1)');
      expect(s.shadowBlur).toBe(6);
    });

    it('should parse opacity', () => {
      expect(parseTailwind('opacity-50')).toEqual({ opacity: 0.5 });
      expect(parseTailwind('opacity-100')).toEqual({ opacity: 1 });
    });
  });

  describe('position', () => {
    it('should parse position type', () => {
      expect(parseTailwind('absolute')).toEqual({ position: 'absolute' });
      expect(parseTailwind('relative')).toEqual({ position: 'relative' });
    });

    it('should parse position values', () => {
      expect(parseTailwind('top-0')).toEqual({ top: 0 });
      expect(parseTailwind('left-4')).toEqual({ left: 16 });
    });
  });

  describe('combinations', () => {
    it('should parse multiple classes', () => {
      const style = parseTailwind('flex flex-row p-4 gap-3 bg-white rounded-lg shadow-md');
      expect(style.display).toBe('flex');
      expect(style.flexDirection).toBe('row');
      expect(style.padding).toBe(16);
      expect(style.gap).toBe(12);
      expect(style.backgroundColor).toBe('#ffffff');
      expect(style.borderRadius).toBe(8);
      expect(style.shadowColor).toBe('rgba(0,0,0,0.1)');
    });

    it('should parse a card-like class string', () => {
      const style = parseTailwind('bg-white p-6 rounded-xl shadow-lg border border-gray-200');
      expect(style.backgroundColor).toBe('#ffffff');
      expect(style.padding).toBe(24);
      expect(style.borderRadius).toBe(12);
      expect(style.borderWidth).toBe(1);
      expect(style.borderColor).toBe('#e5e7eb');
    });

    it('should handle empty and whitespace', () => {
      expect(parseTailwind('')).toEqual({});
      expect(parseTailwind('  ')).toEqual({});
    });

    it('should ignore unknown tokens', () => {
      const style = parseTailwind('flex unknown-class p-4');
      expect(style.display).toBe('flex');
      expect(style.padding).toBe(16);
    });
  });

  describe('caching', () => {
    it('should return cached results', () => {
      const a = parseTailwind('flex p-4');
      const b = parseTailwind('flex p-4');
      expect(a).toBe(b); // Same reference
    });
  });
});
