import type { PxlAnyNode } from '@react-pxl/core';
import { PxlSyntheticEvent } from './synthetic';
import { animate, decay } from 'popmotion';
import type { PlaybackControls } from 'popmotion';

/**
 * Manages scroll state for overflow:scroll containers.
 * Handles wheel events, pointer-drag scrolling, and momentum/spring animations.
 */
export class ScrollManager {
  private animations = new WeakMap<PxlAnyNode, PlaybackControls>();
  /** Accumulated wheel target for smooth spring animation */
  private wheelTargets = new WeakMap<PxlAnyNode, number>();

  /**
   * Find the nearest scrollable ancestor of a node (including itself).
   * A node is scrollable if its style.overflow is 'scroll' or 'auto'.
   */
  findScrollContainer(node: PxlAnyNode): PxlAnyNode | null {
    let current: PxlAnyNode | null = node;
    while (current) {
      const overflow = current.props.style?.overflow;
      if (overflow === 'scroll') return current;
      current = current.parent;
    }
    return null;
  }

  /**
   * Apply a scroll delta to a scroll container immediately.
   * Clamps scroll offsets to valid range based on content size vs viewport.
   * Returns true if scroll position actually changed.
   */
  scroll(container: PxlAnyNode, deltaX: number, deltaY: number, nativeEvent?: Event): boolean {
    const contentHeight = this.getContentHeight(container);
    const contentWidth = this.getContentWidth(container);
    const viewportH = container.layout.height;
    const viewportW = container.layout.width;

    const maxScrollY = Math.max(0, contentHeight - viewportH);
    const maxScrollX = Math.max(0, contentWidth - viewportW);

    const prevTop = container.scrollTop;
    const prevLeft = container.scrollLeft;

    container.scrollTop = Math.max(0, Math.min(maxScrollY, container.scrollTop + deltaY));
    container.scrollLeft = Math.max(0, Math.min(maxScrollX, container.scrollLeft + deltaX));

    const changed = container.scrollTop !== prevTop || container.scrollLeft !== prevLeft;

    if (changed) {
      container.markDirty();

      const handler = (container.props as any).onScroll;
      if (handler) {
        handler(new PxlSyntheticEvent({
          type: 'onScroll',
          target: container,
          currentTarget: container,
          clientX: 0, clientY: 0,
          canvasX: 0, canvasY: 0,
          nativeEvent: nativeEvent ?? new Event('scroll'),
        }));
      }
    }

    return changed;
  }

  /**
   * Animate scroll to a specific target offset using spring physics.
   * Used by wheel scroll for smooth animation.
   */
  animateTo(container: PxlAnyNode, targetY: number): void {
    this.cancelAnimation(container);

    const maxScrollY = Math.max(0, this.getContentHeight(container) - container.layout.height);
    const clampedTarget = Math.max(0, Math.min(maxScrollY, targetY));

    const anim = animate({
      from: container.scrollTop,
      to: clampedTarget,
      type: 'spring',
      stiffness: 300,
      damping: 30,
      restDelta: 0.5,
      onUpdate: (v: number) => {
        const prev = container.scrollTop;
        container.scrollTop = Math.max(0, Math.min(maxScrollY, v));
        if (container.scrollTop !== prev) {
          container.markDirty();
        }
      },
      onComplete: () => {
        this.animations.delete(container);
      },
    });

    this.animations.set(container, anim);
  }

  /**
   * Fling scroll with initial velocity using decay physics.
   * Called on pointer-drag release for momentum scrolling.
   */
  fling(container: PxlAnyNode, velocityY: number): void {
    if (Math.abs(velocityY) < 50) return; // ignore tiny velocities
    this.cancelAnimation(container);

    const maxScrollY = Math.max(0, this.getContentHeight(container) - container.layout.height);

    const anim = decay({
      from: container.scrollTop,
      velocity: velocityY,
      power: 0.8,
      timeConstant: 350,
      restDelta: 0.5,
      onUpdate: (v: number) => {
        const clamped = Math.max(0, Math.min(maxScrollY, v));
        if (clamped !== container.scrollTop) {
          container.scrollTop = clamped;
          container.markDirty();
        }
        // Stop if we hit bounds
        if (clamped <= 0 || clamped >= maxScrollY) {
          const currentAnim = this.animations.get(container);
          if (currentAnim) currentAnim.stop();
          this.animations.delete(container);
        }
      },
      onComplete: () => {
        this.animations.delete(container);
      },
    });

    this.animations.set(container, anim);
  }

  /**
   * Handle wheel event with smooth spring animation.
   * Accumulates wheel deltas into a target and animates toward it.
   */
  smoothWheel(container: PxlAnyNode, deltaY: number, nativeEvent?: Event): void {
    // Accumulate target, clamped to valid scroll range.
    // Without clamping, over-scrolling past a boundary accumulates "debt"
    // that must be reversed before scrolling in the opposite direction works.
    const maxScrollY = Math.max(0, this.getContentHeight(container) - container.layout.height);
    const currentTarget = this.wheelTargets.get(container) ?? container.scrollTop;
    const newTarget = Math.max(0, Math.min(maxScrollY, currentTarget + deltaY));
    this.wheelTargets.set(container, newTarget);

    this.animateTo(container, newTarget);

    // Fire onScroll handler
    const handler = (container.props as any).onScroll;
    if (handler) {
      handler(new PxlSyntheticEvent({
        type: 'onScroll',
        target: container,
        currentTarget: container,
        clientX: 0, clientY: 0,
        canvasX: 0, canvasY: 0,
        nativeEvent: nativeEvent ?? new Event('scroll'),
      }));
    }
  }

  /** Reset wheel target tracking (call when drag starts or scroll position is set externally) */
  resetWheelTarget(container: PxlAnyNode): void {
    this.wheelTargets.set(container, container.scrollTop);
  }

  /** Check if any animation is active on this container */
  isAnimating(container: PxlAnyNode): boolean {
    return this.animations.has(container);
  }

  /** Cancel any active animation on a container */
  cancelAnimation(container: PxlAnyNode): void {
    const anim = this.animations.get(container);
    if (anim) {
      anim.stop();
      this.animations.delete(container);
    }
  }

  /** Get total content height (sum of children layout heights + gaps + padding) */
  private getContentHeight(node: PxlAnyNode): number {
    const style = node.props.style ?? {};
    const pb = (style as any).paddingBottom ?? (style as any).padding ?? 0;
    if (node.children.length === 0) return pb;
    let maxBottom = 0;
    for (const child of node.children) {
      maxBottom = Math.max(maxBottom, child.layout.y + child.layout.height);
    }
    return maxBottom + pb;
  }

  /** Get total content width (sum of children layout widths + padding) */
  private getContentWidth(node: PxlAnyNode): number {
    const style = node.props.style ?? {};
    const pr = (style as any).paddingRight ?? (style as any).padding ?? 0;
    if (node.children.length === 0) return pr;
    let maxRight = 0;
    for (const child of node.children) {
      maxRight = Math.max(maxRight, child.layout.x + child.layout.width);
    }
    return maxRight + pr;
  }
}
