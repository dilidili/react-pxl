import React from 'react';
import type { PxlImageProps } from '@react-pxl/core';

/**
 * Image renders an image from a URL to the canvas.
 * Handles async loading and renders within computed layout bounds.
 */
export function Image(props: PxlImageProps): React.ReactElement {
  return React.createElement('pxl-image', props);
}
