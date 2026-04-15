import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PxlImageNode } from '@react-pxl/core';
import { drawImage } from '../drawImage';

function createMockCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    fillStyle: '',
    font: '',
    textAlign: '' as CanvasTextAlign,
    textBaseline: '' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

describe('drawImage', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  it('should draw placeholder when image is not loaded', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    drawImage(ctx, node, {}, 10, 10, 200, 150);

    // Should draw loading placeholder (fillRect)
    expect((ctx as any).fillRect).toHaveBeenCalledWith(10, 10, 200, 150);
  });

  it('should draw error placeholder when image failed', () => {
    const node = new PxlImageNode({ src: 'bad.png' });
    // Simulate error state
    (node as any)._error = true;

    drawImage(ctx, node, {}, 10, 10, 200, 150);

    // Should draw with error color (#fee2e2)
    expect((ctx as any).fillRect).toHaveBeenCalled();
    // fillStyle should have been set to the error color
    expect((ctx as any).fillStyle).toBeTruthy();
  });

  it('should skip drawing for zero-size boxes', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    drawImage(ctx, node, {}, 10, 10, 0, 100);
    expect((ctx as any).save).not.toHaveBeenCalled();
  });

  it('should draw loaded image with fill mode', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    // Simulate loaded state
    const mockImg = { naturalWidth: 800, naturalHeight: 600 } as HTMLImageElement;
    (node as any)._image = mockImg;
    (node as any)._loaded = true;
    (node as any).naturalWidth = 800;
    (node as any).naturalHeight = 600;

    drawImage(ctx, node, { objectFit: 'fill' }, 0, 0, 200, 150);

    expect((ctx as any).save).toHaveBeenCalled();
    expect((ctx as any).drawImage).toHaveBeenCalledWith(
      mockImg, 0, 0, 800, 600, 0, 0, 200, 150
    );
    expect((ctx as any).restore).toHaveBeenCalled();
  });

  it('should draw loaded image with contain mode', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    const mockImg = { naturalWidth: 800, naturalHeight: 400 } as HTMLImageElement;
    (node as any)._image = mockImg;
    (node as any)._loaded = true;
    (node as any).naturalWidth = 800;
    (node as any).naturalHeight = 400;

    drawImage(ctx, node, { objectFit: 'contain' }, 0, 0, 200, 200);

    expect((ctx as any).drawImage).toHaveBeenCalled();
    const args = (ctx as any).drawImage.mock.calls[0];
    // Image aspect is 2:1, box is 1:1, so image should be 200x100, centered vertically
    expect(args[1]).toBe(0);  // sx
    expect(args[2]).toBe(0);  // sy
    expect(args[3]).toBe(800); // sw
    expect(args[4]).toBe(400); // sh
    expect(args[7]).toBe(200); // dw
    expect(args[8]).toBe(100); // dh = 200 / 2
    // dy should center vertically: (200 - 100) / 2 = 50
    expect(args[6]).toBe(50);
  });

  it('should draw loaded image with cover mode', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    const mockImg = { naturalWidth: 800, naturalHeight: 400 } as HTMLImageElement;
    (node as any)._image = mockImg;
    (node as any)._loaded = true;
    (node as any).naturalWidth = 800;
    (node as any).naturalHeight = 400;

    drawImage(ctx, node, { objectFit: 'cover' }, 0, 0, 200, 200);

    expect((ctx as any).drawImage).toHaveBeenCalled();
    const args = (ctx as any).drawImage.mock.calls[0];
    // Cover: scale = max(200/800, 200/400) = 0.5
    // visibleW = 200/0.5 = 400, visibleH = 200/0.5 = 400
    // sx = (800-400)/2 = 200, sy = (400-400)/2 = 0
    expect(args[1]).toBe(200); // sx
    expect(args[2]).toBe(0);   // sy
    expect(args[7]).toBe(200); // dw (fills box)
    expect(args[8]).toBe(200); // dh (fills box)
  });

  it('should draw with none mode (no scaling)', () => {
    const node = new PxlImageNode({ src: 'test.png' });
    const mockImg = { naturalWidth: 100, naturalHeight: 80 } as HTMLImageElement;
    (node as any)._image = mockImg;
    (node as any)._loaded = true;
    (node as any).naturalWidth = 100;
    (node as any).naturalHeight = 80;

    drawImage(ctx, node, { objectFit: 'none' }, 0, 0, 200, 200);

    const args = (ctx as any).drawImage.mock.calls[0];
    // No scaling — original size centered
    expect(args[3]).toBe(100); // sw
    expect(args[4]).toBe(80);  // sh
    expect(args[7]).toBe(100); // dw
    expect(args[8]).toBe(80);  // dh
    expect(args[5]).toBe(50);  // dx = (200-100)/2
    expect(args[6]).toBe(60);  // dy = (200-80)/2
  });
});
