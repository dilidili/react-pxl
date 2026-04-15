import type { PxlStyle, ComputedLayout } from '../styles';

export type PxlNodeType = 'view' | 'text' | 'image';

export type PxlEventHandler = (event: unknown) => void;

export interface PxlNodeProps {
  style?: PxlStyle;
  // Pointer events
  onClick?: PxlEventHandler;
  onPointerDown?: PxlEventHandler;
  onPointerUp?: PxlEventHandler;
  onPointerMove?: PxlEventHandler;
  onPointerEnter?: PxlEventHandler;
  onPointerLeave?: PxlEventHandler;
  // Keyboard events
  onKeyDown?: PxlEventHandler;
  onKeyUp?: PxlEventHandler;
  // Focus events
  onFocus?: PxlEventHandler;
  onBlur?: PxlEventHandler;
  // Scroll events
  onScroll?: PxlEventHandler;
  // Focus control
  tabIndex?: number;
  testID?: string;
}

export interface PxlTextProps extends PxlNodeProps {
  children?: string;
}

export interface PxlImageProps extends PxlNodeProps {
  src: string;
  alt?: string;
}

/** Base interface for all PxlNodes */
export interface PxlNodeBase {
  readonly type: PxlNodeType;
  readonly id: number;
  props: PxlNodeProps;
  parent: PxlNodeBase | null;
  children: PxlNodeBase[];
  layout: ComputedLayout;
  dirty: boolean;
  yogaNode: unknown; // Will be typed when yoga is integrated
}

export type PxlAnyNode = import('./PxlNode').PxlNode | import('./PxlTextNode').PxlTextNode | import('./PxlImageNode').PxlImageNode;
