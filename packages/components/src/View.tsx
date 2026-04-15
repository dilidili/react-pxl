import React from 'react';
import type { PxlNodeProps } from '@react-pxl/core';

export interface ViewProps extends PxlNodeProps {
  children?: React.ReactNode;
}

/**
 * View is the fundamental container component — the canvas equivalent of <div>.
 * Supports flexbox layout, backgrounds, borders, and event handlers.
 */
export function View(props: ViewProps): React.ReactElement {
  const { children, ...rest } = props;
  return React.createElement('pxl-view', rest, children);
}
