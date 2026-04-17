import React from 'react';
import { render, getRootNode } from '../../packages/reconciler/src/renderer';
import { ScrollTestComponent } from './ScrollTestComponent';

const canvas = document.getElementById('root') as HTMLCanvasElement;
const itemCount = (window as any).__SCROLL_TEST_ITEM_COUNT ?? 1000;
render(<ScrollTestComponent itemCount={itemCount} />, canvas).then(() => {
  const rootNode = getRootNode(canvas);
  (window as any).__REACT_PXL_ROOT__ = rootNode;

  // Expose scroll helpers for deterministic E2E tests
  function findScrollContainer(node: any): any {
    if (node.props?.style?.overflow === 'scroll') return node;
    for (const child of (node.children || [])) {
      const found = findScrollContainer(child);
      if (found) return found;
    }
    return null;
  }

  const scrollContainer = findScrollContainer(rootNode);
  if (scrollContainer) {
    (window as any).__scrollTo = (y: number) => {
      const contentHeight = getContentHeight(scrollContainer);
      const maxY = Math.max(0, contentHeight - scrollContainer.layout.height);
      scrollContainer.scrollTop = Math.max(0, Math.min(maxY, y));
      scrollContainer.markDirty();
    };

    (window as any).__maxScrollY = () => {
      const contentHeight = getContentHeight(scrollContainer);
      return Math.max(0, contentHeight - scrollContainer.layout.height);
    };

    (window as any).__scrollTop = () => scrollContainer.scrollTop;
  }
});

function getContentHeight(node: any): number {
  if (node.children.length === 0) return 0;
  let maxBottom = 0;
  for (const child of node.children) {
    maxBottom = Math.max(maxBottom, child.layout.y + child.layout.height);
  }
  const pb = node.props?.style?.paddingBottom ?? node.props?.style?.padding ?? 0;
  return maxBottom + pb;
}
