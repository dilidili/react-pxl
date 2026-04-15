import type { PxlTextNode } from '@react-pxl/core';

/**
 * Creates a Yoga measure function for text nodes.
 * This function is called by Yoga when it needs to determine the intrinsic
 * size of a text node (since text has no fixed width/height from styles).
 */
export function createTextMeasureFunction(
  textNode: PxlTextNode,
  ctx: CanvasRenderingContext2D
) {
  return (
    _width: number,
    widthMode: number,
    _height: number,
    _heightMode: number
  ) => {
    const maxWidth = widthMode === 0 /* UNDEFINED */ ? undefined : _width;
    const measured = textNode.measureText(ctx, maxWidth);
    return { width: measured.width, height: measured.height };
  };
}
