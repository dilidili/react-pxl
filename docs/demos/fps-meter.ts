/**
 * FPS meter — measures rAF-to-rAF frame times.
 * Renders a live overlay showing current FPS, avg frame time, and dropped frames.
 *
 * Usage:
 *   const meter = new FpsMeter(document.getElementById('fps-overlay')!);
 *   meter.start();
 *   // ... later
 *   const report = meter.stop();
 */
export class FpsMeter {
  private el: HTMLElement;
  private frameTimes: number[] = [];
  private lastTs = 0;
  private rafId: number | null = null;
  private running = false;

  // Rolling window for live FPS display
  private recentFrames: number[] = [];
  private readonly windowSize = 60;

  constructor(el: HTMLElement) {
    this.el = el;
    this.applyStyles();
  }

  private applyStyles(): void {
    Object.assign(this.el.style, {
      position: 'fixed',
      top: '8px',
      right: '8px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#00ff88',
      fontFamily: 'monospace',
      fontSize: '12px',
      padding: '6px 10px',
      borderRadius: '6px',
      zIndex: '99999',
      lineHeight: '1.4',
      pointerEvents: 'none',
      minWidth: '120px',
    });
  }

  start(): void {
    this.running = true;
    this.frameTimes = [];
    this.recentFrames = [];
    this.lastTs = performance.now();
    this.tick();
  }

  private tick = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const dt = now - this.lastTs;
    this.lastTs = now;

    // Skip first frame (unreliable)
    if (this.frameTimes.length > 0 || dt < 100) {
      this.frameTimes.push(dt);
      this.recentFrames.push(dt);
      if (this.recentFrames.length > this.windowSize) {
        this.recentFrames.shift();
      }
    }

    this.updateDisplay();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private updateDisplay(): void {
    if (this.recentFrames.length === 0) {
      this.el.textContent = 'FPS: ---';
      return;
    }

    const avgRecent = this.recentFrames.reduce((a, b) => a + b, 0) / this.recentFrames.length;
    const fps = Math.round(1000 / avgRecent);

    const color = fps >= 55 ? '#00ff88' : fps >= 30 ? '#ffcc00' : '#ff4444';
    this.el.style.color = color;
    this.el.innerHTML = [
      `<b>FPS: ${fps}</b>`,
      `Frame: ${avgRecent.toFixed(1)}ms`,
    ].join('<br>');
  }

  stop(): FpsReport {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const times = this.frameTimes.slice();
    if (times.length === 0) {
      return { fps: 0, avgMs: 0, p99Ms: 0, droppedFrames: 0, totalFrames: 0, frameTimes: [] };
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    const dropped = times.filter(t => t > 16.67).length;

    return {
      fps: Math.round(1000 / avg),
      avgMs: +avg.toFixed(2),
      p99Ms: +p99.toFixed(2),
      droppedFrames: dropped,
      totalFrames: times.length,
      frameTimes: times,
    };
  }
}

export interface FpsReport {
  fps: number;
  avgMs: number;
  p99Ms: number;
  droppedFrames: number;
  totalFrames: number;
  frameTimes: number[];
}
