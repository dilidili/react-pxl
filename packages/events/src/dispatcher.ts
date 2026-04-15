import type { PxlAnyNode } from '@react-pxl/core';
import { HitTester } from './hitTest';
import { PxlSyntheticEvent } from './synthetic';
import { FocusManager } from './focusManager';
import { ScrollManager } from './scrollManager';
import { CursorManager } from './cursorManager';

type PointerEventName = 'onClick' | 'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onPointerEnter' | 'onPointerLeave';
type KeyboardEventName = 'onKeyDown' | 'onKeyUp';

const domToReactEventMap: Record<string, PointerEventName> = {
  click: 'onClick',
  pointerdown: 'onPointerDown',
  pointerup: 'onPointerUp',
  pointermove: 'onPointerMove',
};

/**
 * EventDispatcher bridges browser DOM events to the PxlNode event system.
 * Handles pointer events, keyboard events, focus management, scrolling, and cursor.
 */
export class EventDispatcher {
  private canvas: HTMLCanvasElement;
  private rootNode: PxlAnyNode;
  private hitTester = new HitTester();
  readonly focus = new FocusManager();
  readonly scroll = new ScrollManager();
  readonly cursor: CursorManager;
  private hoveredNode: PxlAnyNode | null = null;
  private listeners: Array<{ target: EventTarget; event: string; handler: (e: Event) => void }> = [];

  constructor(canvas: HTMLCanvasElement, rootNode: PxlAnyNode) {
    this.canvas = canvas;
    this.rootNode = rootNode;
    this.cursor = new CursorManager(canvas);
  }

  /** Start listening for events on the canvas */
  attach(): void {
    // Pointer events on canvas
    const pointerEvents = ['click', 'pointerdown', 'pointerup', 'pointermove'];
    for (const event of pointerEvents) {
      const handler = (e: Event) => this.handlePointerEvent(e as PointerEvent, event);
      this.canvas.addEventListener(event, handler);
      this.listeners.push({ target: this.canvas, event, handler });
    }

    // Wheel events on canvas (for scroll containers)
    const wheelHandler = (e: Event) => this.handleWheelEvent(e as WheelEvent);
    this.canvas.addEventListener('wheel', wheelHandler, { passive: false });
    this.listeners.push({ target: this.canvas, event: 'wheel', handler: wheelHandler });

    // Keyboard events on window (canvas doesn't receive key events naturally)
    const keydownHandler = (e: Event) => this.handleKeyboardEvent(e as KeyboardEvent, 'onKeyDown');
    const keyupHandler = (e: Event) => this.handleKeyboardEvent(e as KeyboardEvent, 'onKeyUp');
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);
    this.listeners.push({ target: window, event: 'keydown', handler: keydownHandler });
    this.listeners.push({ target: window, event: 'keyup', handler: keyupHandler });

    // Make canvas focusable so it can receive keyboard events
    if (!this.canvas.getAttribute('tabindex')) {
      this.canvas.setAttribute('tabindex', '0');
    }
  }

  /** Stop listening for events */
  detach(): void {
    for (const { target, event, handler } of this.listeners) {
      target.removeEventListener(event, handler);
    }
    this.listeners = [];
    this.cursor.reset();
    this.focus.setFocus(null);
  }

  setRootNode(node: PxlAnyNode): void {
    this.rootNode = node;
  }

  private getCanvasCoords(domEvent: MouseEvent): { canvasX: number; canvasY: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      canvasX: domEvent.clientX - rect.left,
      canvasY: domEvent.clientY - rect.top,
    };
  }

  private handlePointerEvent(domEvent: PointerEvent, eventType: string): void {
    const { canvasX, canvasY } = this.getCanvasCoords(domEvent);
    const hitNode = this.hitTester.hitTest(this.rootNode, canvasX, canvasY);

    // Pointer enter/leave + cursor
    if (eventType === 'pointermove') {
      if (hitNode !== this.hoveredNode) {
        if (this.hoveredNode) {
          this.dispatchToNode(this.hoveredNode, 'onPointerLeave', domEvent, canvasX, canvasY);
        }
        if (hitNode) {
          this.dispatchToNode(hitNode, 'onPointerEnter', domEvent, canvasX, canvasY);
        }
        this.hoveredNode = hitNode;
        this.cursor.update(hitNode);
      }
    }

    // Focus on click
    if (eventType === 'click' && hitNode) {
      if (this.focus.isFocusable(hitNode)) {
        this.focus.setFocus(hitNode, domEvent);
      } else {
        this.focus.setFocus(null, domEvent);
      }
    }

    if (!hitNode) return;

    const reactEventName = domToReactEventMap[eventType];
    if (!reactEventName) return;

    this.dispatchWithBubbling(hitNode, reactEventName, domEvent, canvasX, canvasY);
  }

  private handleKeyboardEvent(domEvent: KeyboardEvent, eventName: KeyboardEventName): void {
    // Tab navigation
    if (eventName === 'onKeyDown' && domEvent.key === 'Tab') {
      // Only handle if our canvas has focus
      if (document.activeElement !== this.canvas) return;
      domEvent.preventDefault();
      this.focus.moveFocus(this.rootNode, domEvent.shiftKey ? 'backward' : 'forward', domEvent);
      return;
    }

    const focused = this.focus.focusedNode;
    if (!focused) return;

    // Dispatch keyboard event with bubbling through the path
    const path = this.hitTester.getPath(focused);
    for (let i = path.length - 1; i >= 0; i--) {
      const node = path[i];
      const handler = (node.props as any)[eventName];
      if (handler) {
        const syntheticEvent = new PxlSyntheticEvent({
          type: eventName,
          target: focused,
          currentTarget: node,
          clientX: 0,
          clientY: 0,
          canvasX: 0,
          canvasY: 0,
          nativeEvent: domEvent,
        });
        // Attach keyboard-specific fields
        (syntheticEvent as any).key = domEvent.key;
        (syntheticEvent as any).code = domEvent.code;
        (syntheticEvent as any).shiftKey = domEvent.shiftKey;
        (syntheticEvent as any).ctrlKey = domEvent.ctrlKey;
        (syntheticEvent as any).altKey = domEvent.altKey;
        (syntheticEvent as any).metaKey = domEvent.metaKey;
        (syntheticEvent as any).repeat = domEvent.repeat;

        handler(syntheticEvent);
        if (syntheticEvent.isPropagationStopped) break;
      }
    }
  }

  private handleWheelEvent(domEvent: WheelEvent): void {
    const { canvasX, canvasY } = this.getCanvasCoords(domEvent);
    const hitNode = this.hitTester.hitTest(this.rootNode, canvasX, canvasY);
    if (!hitNode) return;

    const scrollContainer = this.scroll.findScrollContainer(hitNode);
    if (!scrollContainer) return;

    domEvent.preventDefault();
    this.scroll.scroll(scrollContainer, domEvent.deltaX, domEvent.deltaY, domEvent);
  }

  private dispatchWithBubbling(
    target: PxlAnyNode,
    eventName: PointerEventName,
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
    eventName: PointerEventName,
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
