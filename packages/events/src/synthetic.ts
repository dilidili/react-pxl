import type { PxlAnyNode } from '@react-pxl/core';

/**
 * Synthetic event that mirrors DOM event interface for canvas elements.
 */
export class PxlSyntheticEvent {
  readonly type: string;
  readonly target: PxlAnyNode;
  readonly currentTarget: PxlAnyNode;
  readonly clientX: number;
  readonly clientY: number;
  readonly canvasX: number;
  readonly canvasY: number;
  readonly timestamp: number;
  readonly nativeEvent: Event;

  private _stopped = false;
  private _defaultPrevented = false;

  constructor(params: {
    type: string;
    target: PxlAnyNode;
    currentTarget: PxlAnyNode;
    clientX: number;
    clientY: number;
    canvasX: number;
    canvasY: number;
    nativeEvent: Event;
  }) {
    this.type = params.type;
    this.target = params.target;
    this.currentTarget = params.currentTarget;
    this.clientX = params.clientX;
    this.clientY = params.clientY;
    this.canvasX = params.canvasX;
    this.canvasY = params.canvasY;
    this.nativeEvent = params.nativeEvent;
    this.timestamp = Date.now();
  }

  stopPropagation(): void {
    this._stopped = true;
  }

  preventDefault(): void {
    this._defaultPrevented = true;
  }

  get isPropagationStopped(): boolean {
    return this._stopped;
  }

  get isDefaultPrevented(): boolean {
    return this._defaultPrevented;
  }
}
