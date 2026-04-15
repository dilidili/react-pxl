import Reconciler from 'react-reconciler';
import type { ReactNode } from 'react';
import { PxlNode } from '@react-pxl/core';
import { YogaBridge } from '@react-pxl/layout';
import { CanvasPipeline } from '@react-pxl/renderer';
import { EventDispatcher } from '@react-pxl/events';
import { hostConfig } from './hostConfig';

const reconciler = Reconciler(hostConfig as any);

interface PxlRoot {
  container: any;
  rootNode: PxlNode;
  pipeline: CanvasPipeline;
  yoga: YogaBridge;
  events: EventDispatcher;
}

const roots = new Map<HTMLCanvasElement, PxlRoot>();

/**
 * Render a React element tree to an HTML Canvas element.
 *
 * @example
 * ```tsx
 * import { render } from 'react-pxl';
 *
 * function App() {
 *   return (
 *     <View style={{ flex: 1, backgroundColor: '#f0f0f0', padding: 20 }}>
 *       <Text style={{ fontSize: 24, color: '#333' }}>Hello, Canvas!</Text>
 *     </View>
 *   );
 * }
 *
 * const canvas = document.getElementById('root') as HTMLCanvasElement;
 * render(<App />, canvas);
 * ```
 */
export async function render(
  element: ReactNode,
  canvas: HTMLCanvasElement,
  callback?: () => void
): Promise<void> {
  let root = roots.get(canvas);

  if (!root) {
    const yoga = await YogaBridge.create();
    const pipeline = new CanvasPipeline(canvas);
    const rootNode = new PxlNode({ style: { width: pipeline.width, height: pipeline.height } });

    // Set canvas context for text measurement during Yoga layout
    yoga.setMeasureContext(pipeline.context);

    const onCommit = () => {
      yoga.buildTree(rootNode);
      yoga.computeLayout(rootNode, pipeline.width, pipeline.height);
      pipeline.markDirty();
    };

    const container = reconciler.createContainer(
      { rootNode, onCommit },
      0, // ConcurrentRoot
      null,
      false, // isStrictMode
      null,
      'react-pxl',
      (error: Error) => console.error('[react-pxl]', error),
      null
    );

    root = { container, rootNode, pipeline, yoga, events: new EventDispatcher(canvas, rootNode) };
    roots.set(canvas, root);

    pipeline.setRootNode(rootNode);
    pipeline.start();
    root.events.attach();
  }

  reconciler.updateContainerSync(element, root.container, null, callback ?? (() => {}));
  reconciler.flushSyncWork();
}

/** Unmount the React tree from a canvas */
export function unmount(canvas: HTMLCanvasElement): void {
  const root = roots.get(canvas);
  if (root) {
    reconciler.updateContainer(null, root.container, null, () => {});
    root.events.detach();
    root.pipeline.stop();
    roots.delete(canvas);
  }
}
