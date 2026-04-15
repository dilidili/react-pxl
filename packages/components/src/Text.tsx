import React from 'react';
import type { PxlTextProps } from '@react-pxl/core';

export interface TextProps extends PxlTextProps {
  children?: string;
}

/**
 * Text renders text content to canvas.
 * Supports font sizing, colors, alignment, and word wrapping.
 */
export function Text(props: TextProps): React.ReactElement {
  const { children, ...rest } = props;
  return React.createElement('pxl-text', { ...rest, children }, children);
}
