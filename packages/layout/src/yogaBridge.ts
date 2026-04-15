import type { PxlAnyNode, PxlStyle, ComputedLayout } from '@react-pxl/core';

/**
 * YogaBridge maps PxlNode style props to Yoga layout nodes and computes layout.
 *
 * Since yoga-wasm-web requires async initialization, the bridge must be
 * initialized before use via YogaBridge.create().
 */
export class YogaBridge {
  private yoga: any;
  private nodeMap = new WeakMap<PxlAnyNode, any>();

  private constructor(yoga: any) {
    this.yoga = yoga;
  }

  /** Create and initialize the Yoga bridge (loads WASM) */
  static async create(): Promise<YogaBridge> {
    // Dynamic import so WASM is loaded lazily
    const yogaModule = await import('yoga-wasm-web');
    const yoga = await yogaModule.default();
    return new YogaBridge(yoga);
  }

  /** Create a Yoga node for a PxlNode and apply its styles */
  createYogaNode(node: PxlAnyNode): any {
    const yogaNode = this.yoga.Node.create();
    this.nodeMap.set(node, yogaNode);
    this.applyStyles(node, yogaNode);
    return yogaNode;
  }

  /** Get the Yoga node associated with a PxlNode */
  getYogaNode(node: PxlAnyNode): any | undefined {
    return this.nodeMap.get(node);
  }

  /** Remove and free a Yoga node */
  destroyYogaNode(node: PxlAnyNode): void {
    const yogaNode = this.nodeMap.get(node);
    if (yogaNode) {
      yogaNode.free();
      this.nodeMap.delete(node);
    }
  }

  /** Apply PxlStyle to a Yoga node */
  applyStyles(node: PxlAnyNode, yogaNode?: any): void {
    const yn = yogaNode ?? this.nodeMap.get(node);
    if (!yn) return;

    const style: PxlStyle = node.props.style ?? {};
    const Y = this.yoga;

    // Display
    if (style.display === 'none') {
      yn.setDisplay(Y.DISPLAY_NONE);
    } else {
      yn.setDisplay(Y.DISPLAY_FLEX);
    }

    // Position
    if (style.position === 'absolute') {
      yn.setPositionType(Y.POSITION_TYPE_ABSOLUTE);
    } else {
      yn.setPositionType(Y.POSITION_TYPE_RELATIVE);
    }

    // Flex direction
    const flexDirMap: Record<string, number> = {
      'row': Y.FLEX_DIRECTION_ROW,
      'column': Y.FLEX_DIRECTION_COLUMN,
      'row-reverse': Y.FLEX_DIRECTION_ROW_REVERSE,
      'column-reverse': Y.FLEX_DIRECTION_COLUMN_REVERSE,
    };
    if (style.flexDirection) {
      yn.setFlexDirection(flexDirMap[style.flexDirection] ?? Y.FLEX_DIRECTION_COLUMN);
    }

    // Flex wrap
    if (style.flexWrap === 'wrap') yn.setFlexWrap(Y.WRAP_WRAP);
    else if (style.flexWrap === 'wrap-reverse') yn.setFlexWrap(Y.WRAP_WRAP_REVERSE);
    else yn.setFlexWrap(Y.WRAP_NO_WRAP);

    // Justify content
    const justifyMap: Record<string, number> = {
      'flex-start': Y.JUSTIFY_FLEX_START,
      'flex-end': Y.JUSTIFY_FLEX_END,
      'center': Y.JUSTIFY_CENTER,
      'space-between': Y.JUSTIFY_SPACE_BETWEEN,
      'space-around': Y.JUSTIFY_SPACE_AROUND,
      'space-evenly': Y.JUSTIFY_SPACE_EVENLY,
    };
    if (style.justifyContent) {
      yn.setJustifyContent(justifyMap[style.justifyContent] ?? Y.JUSTIFY_FLEX_START);
    }

    // Align items
    const alignMap: Record<string, number> = {
      'flex-start': Y.ALIGN_FLEX_START,
      'flex-end': Y.ALIGN_FLEX_END,
      'center': Y.ALIGN_CENTER,
      'stretch': Y.ALIGN_STRETCH,
      'baseline': Y.ALIGN_BASELINE,
    };
    if (style.alignItems) {
      yn.setAlignItems(alignMap[style.alignItems] ?? Y.ALIGN_STRETCH);
    }

    // Align self
    if (style.alignSelf && style.alignSelf !== 'auto') {
      yn.setAlignSelf(alignMap[style.alignSelf] ?? Y.ALIGN_AUTO);
    }

    // Flex values
    if (style.flex !== undefined) yn.setFlex(style.flex);
    if (style.flexGrow !== undefined) yn.setFlexGrow(style.flexGrow);
    if (style.flexShrink !== undefined) yn.setFlexShrink(style.flexShrink);
    if (style.flexBasis !== undefined) {
      if (typeof style.flexBasis === 'number') yn.setFlexBasis(style.flexBasis);
    }

    // Dimensions
    if (style.width !== undefined && typeof style.width === 'number') yn.setWidth(style.width);
    if (style.height !== undefined && typeof style.height === 'number') yn.setHeight(style.height);
    if (style.minWidth !== undefined && typeof style.minWidth === 'number') yn.setMinWidth(style.minWidth);
    if (style.minHeight !== undefined && typeof style.minHeight === 'number') yn.setMinHeight(style.minHeight);
    if (style.maxWidth !== undefined && typeof style.maxWidth === 'number') yn.setMaxWidth(style.maxWidth);
    if (style.maxHeight !== undefined && typeof style.maxHeight === 'number') yn.setMaxHeight(style.maxHeight);

    // Aspect ratio
    if (style.aspectRatio !== undefined) yn.setAspectRatio(style.aspectRatio);

    // Gap
    if (style.gap !== undefined) yn.setGap(Y.GUTTER_ALL, style.gap);
    if (style.rowGap !== undefined) yn.setGap(Y.GUTTER_ROW, style.rowGap);
    if (style.columnGap !== undefined) yn.setGap(Y.GUTTER_COLUMN, style.columnGap);

    // Margins
    if (style.marginTop !== undefined) yn.setMargin(Y.EDGE_TOP, style.marginTop);
    if (style.marginRight !== undefined) yn.setMargin(Y.EDGE_RIGHT, style.marginRight);
    if (style.marginBottom !== undefined) yn.setMargin(Y.EDGE_BOTTOM, style.marginBottom);
    if (style.marginLeft !== undefined) yn.setMargin(Y.EDGE_LEFT, style.marginLeft);

    // Padding
    if (style.paddingTop !== undefined) yn.setPadding(Y.EDGE_TOP, style.paddingTop);
    if (style.paddingRight !== undefined) yn.setPadding(Y.EDGE_RIGHT, style.paddingRight);
    if (style.paddingBottom !== undefined) yn.setPadding(Y.EDGE_BOTTOM, style.paddingBottom);
    if (style.paddingLeft !== undefined) yn.setPadding(Y.EDGE_LEFT, style.paddingLeft);

    // Position values
    if (style.top !== undefined) yn.setPosition(Y.EDGE_TOP, style.top);
    if (style.right !== undefined) yn.setPosition(Y.EDGE_RIGHT, style.right);
    if (style.bottom !== undefined) yn.setPosition(Y.EDGE_BOTTOM, style.bottom);
    if (style.left !== undefined) yn.setPosition(Y.EDGE_LEFT, style.left);

    // Overflow
    if (style.overflow === 'hidden') yn.setOverflow(Y.OVERFLOW_HIDDEN);
    else if (style.overflow === 'scroll') yn.setOverflow(Y.OVERFLOW_SCROLL);
    else yn.setOverflow(Y.OVERFLOW_VISIBLE);

    // Border widths (Yoga uses border for layout calculations)
    if (style.borderTopWidth !== undefined) yn.setBorder(Y.EDGE_TOP, style.borderTopWidth);
    if (style.borderRightWidth !== undefined) yn.setBorder(Y.EDGE_RIGHT, style.borderRightWidth);
    if (style.borderBottomWidth !== undefined) yn.setBorder(Y.EDGE_BOTTOM, style.borderBottomWidth);
    if (style.borderLeftWidth !== undefined) yn.setBorder(Y.EDGE_LEFT, style.borderLeftWidth);
  }

  /**
   * Compute layout for the entire tree starting from the root node.
   * Returns computed layouts applied to each PxlNode.
   */
  computeLayout(rootNode: PxlAnyNode, availableWidth: number, availableHeight: number): void {
    const rootYoga = this.nodeMap.get(rootNode);
    if (!rootYoga) return;

    rootYoga.calculateLayout(availableWidth, availableHeight);
    this.extractLayout(rootNode, rootYoga);
  }

  private extractLayout(node: PxlAnyNode, yogaNode: any): void {
    node.layout = {
      x: yogaNode.getComputedLeft(),
      y: yogaNode.getComputedTop(),
      width: yogaNode.getComputedWidth(),
      height: yogaNode.getComputedHeight(),
    };
    node.dirty = false;

    for (let i = 0; i < node.children.length; i++) {
      const childYoga = yogaNode.getChild(i);
      if (childYoga) {
        this.extractLayout(node.children[i], childYoga);
      }
    }
  }

  /** Build the Yoga tree mirroring the PxlNode tree */
  buildTree(rootNode: PxlAnyNode): void {
    this.buildNodeRecursive(rootNode, null, 0);
  }

  private buildNodeRecursive(node: PxlAnyNode, parentYoga: any | null, index: number): void {
    let yogaNode = this.nodeMap.get(node);
    if (!yogaNode) {
      yogaNode = this.createYogaNode(node);
    } else {
      this.applyStyles(node, yogaNode);
    }

    if (parentYoga) {
      parentYoga.insertChild(yogaNode, index);
    }

    for (let i = 0; i < node.children.length; i++) {
      this.buildNodeRecursive(node.children[i], yogaNode, i);
    }
  }
}
