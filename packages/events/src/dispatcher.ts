import type { PxlAnyNode } from '@react-pxl/core';
import { HitTester } from './hitTest';
import { PxlSyntheticEvent } from './synthetic';

type EventName = 'onClick' | 'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onPointerEnter' | 'onPointerLeave';

const domToReactEventMap: Record<string, EventName> = {
  click: 'onClick',
  pointerdown: 'onPointerDown',
  pointerup: 'onPointerUp',
  pointermove: 'onPointerMove',
};

/**
 * EventDispatcher bridges browser DOM events to the PxlNode event system.
 * It listens on the canvas element and dispatches synthetic events with bubbling.
 */
export class EventDispatcher {
  private canvas: HTMLCanvasElement;
  private rootNode: PxlAnyNode;
  private hitTester = new HitTester();
  private hoveredNode: PxlAnyNode | null = null;
  private listeners: Array<{ event: string; handler: (e: Event) => void }> = [];

  constructor(canvas: HTMLCanvasElement, rootNode: PxlAnyNode) {
    this.canvas = canvas;
    this.rootNode = rootNode;
  }

  /** Start listening for events on the canvas */
  attach(): void {
    const events = ['click', 'pointerdown', 'pointerup', 'pointermove'];
    for (const event of events) {
      const handler = (e: Event) => this.handleEvent(e as PointerEvent, event);
      this.canvas.addEventListener(event, handler);
      this.listeners.push({ event, handler });
    }
  }

  /** Stop listening for events */
  detach(): void {
    for (const { event, handler } of this.listeners) {
      this.canvas.removeEventListener(event, handler);
    }
    this.listeners = [];
  }

  setRootNode(node: PxlAnyNode): void {
    this.rootNode = node;
  }

  private handleEvent(domEvent: PointerEvent, eventType: string): void {
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = domEvent.clientX - rect.left;
    const canvasY = domEvent.clientY - rect.top;

    const hitNode = this.hitTester.hitTest(this.rootNode, canvasX, canvasY);

    // Handle pointer enter/leave
    if (eventType === 'pointermove') {
      if (hitNode !== this.hoveredNode) {
        if (this.hoveredNode) {
          this.dispatchToNode(this.hoveredNode, 'onPointerLeave', domEvent, canvasX, canvasY);
        }
        if (hitNode) {
          this.dispatchToNode(hitNode, 'onPointerEnter', domEvent, canvasX, canvasY);
        }
        this.hoveredNode = hitNode;

        // Update cursor
        this.canvas.style.cursor = hitNode?.props.onClick ? 'pointer' : 'default';
      }
    }

    if (!hitNode) return;

    const reactEventName = domToReactEventMap[eventType];
    if (!reactEventName) return;

    // Dispatch with bubbling
    this.dispatchWithBubbling(hitNode, reactEventName, domEvent, canvasX, canvasY);
  }

  private dispatchWithBubbling(
    target: PxlAnyNode,
    eventName: EventName,
    domEvent: PointerEvent,
    canvasX: number,
    canvasY: number
  ): void {
    const path = this.hitTester.getPath(target);

    // Bubble phase (target → root)
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      const handler = (node.props as any)[eventName];

      if (handler) {
        const syntheticEvent = new PxlSyntheticEvent({
          type: eventName,
          target,
          currentTarget: node,
          clientX: domEvent.clientX,
          clientY: domEvent.clientY,
          canvasX,
          canvasY,
          nativeEvent: domEvent,
        });

        handler(syntheticEvent);

        if (syntheticEvent.isPropagationStopped) break;
      }
    }
  }

  private dispatchToNode(
    node: PxlAnyNode,
    eventName: EventName,
    domEvent: PointerEvent,
    canvasX: number,
    canvasY: number
  ): void {
    const handler = (node.props as any)[eventName];
    if (handler) {
      handler(
        new PxlSyntheticEvent({
          type: eventName,
          target: node,
          currentTarget: node,
          clientX: domEvent.clientX,
          clientY: domEvent.clientY,
          canvasX,
          canvasY,
          nativeEvent: domEvent,
        })
      );
    }
  }
}
