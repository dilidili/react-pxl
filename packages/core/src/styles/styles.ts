/**
 * Style properties for react-pxl nodes.
 * Inspired by React Native's style system — CSS-like but canvas-targeted.
 */

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
export type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
export type AlignSelf = 'auto' | AlignItems;
export type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around';
export type Overflow = 'visible' | 'hidden' | 'scroll';
export type Position = 'relative' | 'absolute';
export type Display = 'flex' | 'none';
export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
export type FontStyle = 'normal' | 'italic';
export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';

export interface PxlStyle {
  // Layout (Yoga)
  display?: Display;
  position?: Position;
  flexDirection?: FlexDirection;
  flexWrap?: FlexWrap;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  alignSelf?: AlignSelf;
  alignContent?: AlignContent;
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  aspectRatio?: number;
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  overflow?: Overflow;

  // Spacing
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;

  // Position (when position: 'absolute')
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;

  // Visual
  backgroundColor?: string;
  opacity?: number;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;

  // Shadow
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;

  // Text
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  lineHeight?: number;
  textAlign?: TextAlign;
  letterSpacing?: number;

  // Image
  objectFit?: ObjectFit;
}

/** Computed layout output from Yoga */
export interface ComputedLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Resolve shorthand style properties into explicit values */
export function resolveStyle(style: PxlStyle): PxlStyle {
  const resolved = { ...style };

  if (resolved.margin !== undefined) {
    resolved.marginTop ??= resolved.margin;
    resolved.marginRight ??= resolved.margin;
    resolved.marginBottom ??= resolved.margin;
    resolved.marginLeft ??= resolved.margin;
  }
  if (resolved.marginHorizontal !== undefined) {
    resolved.marginLeft ??= resolved.marginHorizontal;
    resolved.marginRight ??= resolved.marginHorizontal;
  }
  if (resolved.marginVertical !== undefined) {
    resolved.marginTop ??= resolved.marginVertical;
    resolved.marginBottom ??= resolved.marginVertical;
  }

  if (resolved.padding !== undefined) {
    resolved.paddingTop ??= resolved.padding;
    resolved.paddingRight ??= resolved.padding;
    resolved.paddingBottom ??= resolved.padding;
    resolved.paddingLeft ??= resolved.padding;
  }
  if (resolved.paddingHorizontal !== undefined) {
    resolved.paddingLeft ??= resolved.paddingHorizontal;
    resolved.paddingRight ??= resolved.paddingHorizontal;
  }
  if (resolved.paddingVertical !== undefined) {
    resolved.paddingTop ??= resolved.paddingVertical;
    resolved.paddingBottom ??= resolved.paddingVertical;
  }

  if (resolved.borderWidth !== undefined) {
    resolved.borderTopWidth ??= resolved.borderWidth;
    resolved.borderRightWidth ??= resolved.borderWidth;
    resolved.borderBottomWidth ??= resolved.borderWidth;
    resolved.borderLeftWidth ??= resolved.borderWidth;
  }

  if (resolved.borderColor !== undefined) {
    resolved.borderTopColor ??= resolved.borderColor;
    resolved.borderRightColor ??= resolved.borderColor;
    resolved.borderBottomColor ??= resolved.borderColor;
    resolved.borderLeftColor ??= resolved.borderColor;
  }

  if (resolved.borderRadius !== undefined) {
    resolved.borderTopLeftRadius ??= resolved.borderRadius;
    resolved.borderTopRightRadius ??= resolved.borderRadius;
    resolved.borderBottomLeftRadius ??= resolved.borderRadius;
    resolved.borderBottomRightRadius ??= resolved.borderRadius;
  }

  return resolved;
}
