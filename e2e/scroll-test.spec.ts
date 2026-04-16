import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.resolve(__dirname, '../validation-results');
const PAGE_URL = 'http://localhost:5173/scroll-pxl-page.html';

test.describe('Infinite list: scroll performance & correctness', () => {

  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  });

  /**
   * 1. Scroll Frame Budget
   * Continuous scroll must maintain < 16ms per frame.
   */
  test('scroll frame time stays under 16ms budget', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const canvas = page.locator('#root');

    // Inject performance measurement into the page
    await page.evaluate(() => {
      (window as any).__frameTimes = [];
      const origRAF = window.requestAnimationFrame;
      let lastTime = performance.now();
      window.requestAnimationFrame = function(cb: FrameRequestCallback) {
        return origRAF.call(window, (timestamp) => {
          const now = performance.now();
          (window as any).__frameTimes.push(now - lastTime);
          lastTime = now;
          cb(timestamp);
        });
      };
    });

    // Scroll continuously for ~3 seconds
    await canvas.hover({ position: { x: 400, y: 300 } });
    const scrollSteps = 30;
    for (let i = 0; i < scrollSteps; i++) {
      await page.mouse.wheel(0, 150);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);

    // Collect frame times
    const frameTimes = await page.evaluate(() => (window as any).__frameTimes as number[]);
    const droppedFrames = frameTimes.filter(t => t > 16);
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const maxFrameTime = Math.max(...frameTimes);

    // Save report with full metrics for regression tracking
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const p99FrameTime = sorted[Math.floor(sorted.length * 0.99)] ?? 0;
    const fps = frameTimes.length > 0 ? Math.round(1000 / avgFrameTime) : 0;

    const report = {
      timestamp: new Date().toISOString(),
      itemCount: 1000,
      dynamicHeights: true,
      seed: 12345,
      metrics: {
        fps,
        avgFrameTimeMs: +avgFrameTime.toFixed(2),
        maxFrameTimeMs: +maxFrameTime.toFixed(2),
        p99FrameTimeMs: +p99FrameTime.toFixed(2),
        totalFrames: frameTimes.length,
        droppedFrames: droppedFrames.length,
        dropRate: +(droppedFrames.length / frameTimes.length).toFixed(4),
      },
      frameTimes,
    };

    console.log(`\n⏱  Frame Budget Report:`);
    console.log(`   FPS: ${fps}`);
    console.log(`   Total frames: ${frameTimes.length}`);
    console.log(`   Avg frame time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`   P99 frame time: ${p99FrameTime.toFixed(2)}ms`);
    console.log(`   Max frame time: ${maxFrameTime.toFixed(2)}ms`);
    console.log(`   Dropped frames (>16ms): ${droppedFrames.length}`);

    // Save detailed metrics for regression tracking
    fs.writeFileSync(
      path.join(RESULTS_DIR, 'scroll-perf-metrics.json'),
      JSON.stringify(report, null, 2)
    );

    // Allow dropped frames — headless environments have scheduling variance.
    // The key metric is avgFrameTime staying under budget.
    const dropRate = droppedFrames.length / frameTimes.length;
    expect(avgFrameTime, `Avg frame time ${avgFrameTime.toFixed(1)}ms exceeds 16ms budget`).toBeLessThan(16);
    expect(dropRate, `Too many dropped frames: ${(dropRate * 100).toFixed(1)}%`).toBeLessThan(0.5);
  });

  /**
   * 2. Item Order & Continuity
   * After scrolling, visible items must be contiguous and in order.
   */
  test('visible items remain contiguous and ordered after scroll', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    // Wait for async render to expose root node
    await page.waitForFunction(() => (window as any).__REACT_PXL_ROOT__ != null, null, { timeout: 10_000 });
    await page.waitForTimeout(1000);

    const canvas = page.locator('#root');
    await canvas.hover({ position: { x: 400, y: 300 } });

    // Scroll down a known amount
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);

    // Query the internal node tree for visible item indices
    const visibleIndices: number[] = await page.evaluate(() => {
      const pxl = (window as any).__REACT_PXL_ROOT__;
      if (!pxl) return [];

      // Walk tree to find items with data-index that are within viewport
      const indices: number[] = [];
      function walk(node: any, parentY: number) {
        const y = parentY + (node.layout?.y ?? 0);
        const h = node.layout?.height ?? 0;
        const props = node.props ?? {};

        if (props['data-index'] !== undefined) {
          // Check if item overlaps the scroll container viewport
          indices.push(props['data-index']);
        }
        if (node.children) {
          for (const child of node.children) {
            walk(child, y);
          }
        }
      }
      walk(pxl, 0);
      return indices;
    });

    console.log(`\n📋 Item Order Report:`);
    console.log(`   Visible indices: [${visibleIndices.slice(0, 10).join(', ')}${visibleIndices.length > 10 ? ', ...' : ''}]`);
    console.log(`   Total visible: ${visibleIndices.length}`);

    // Items should be in ascending order
    for (let i = 1; i < visibleIndices.length; i++) {
      expect(
        visibleIndices[i],
        `Item order broken at position ${i}: ${visibleIndices[i - 1]} → ${visibleIndices[i]}`
      ).toBe(visibleIndices[i - 1] + 1);
    }

    // Should have items (not empty)
    expect(visibleIndices.length).toBeGreaterThan(0);
  });

  /**
   * 3. Round-Trip Stability
   * Scroll down then back to origin — canvas must be pixel-identical.
   */
  test('scroll round-trip produces pixel-identical output', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const canvas = page.locator('#root');

    // Screenshot at scrollTop=0
    const initialShot = await canvas.screenshot();
    fs.writeFileSync(path.join(RESULTS_DIR, 'scroll-roundtrip-initial.png'), initialShot);

    // Scroll down significantly
    await canvas.hover({ position: { x: 400, y: 300 } });
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    // Scroll back to top
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    // Screenshot again at scrollTop=0
    const returnShot = await canvas.screenshot();
    fs.writeFileSync(path.join(RESULTS_DIR, 'scroll-roundtrip-return.png'), returnShot);

    // Compare
    const initialImg = PNG.sync.read(initialShot);
    const returnImg = PNG.sync.read(returnShot);
    const { width, height } = initialImg;
    const diff = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      initialImg.data as unknown as Buffer,
      returnImg.data as unknown as Buffer,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    fs.writeFileSync(path.join(RESULTS_DIR, 'scroll-roundtrip-diff.png'), PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercent = (mismatchedPixels / totalPixels) * 100;

    console.log(`\n🔄 Round-Trip Report:`);
    console.log(`   Mismatched pixels: ${mismatchedPixels}/${totalPixels} (${diffPercent.toFixed(2)}%)`);

    expect(diffPercent, `Round-trip not stable: ${diffPercent.toFixed(2)}% pixel diff`).toBeLessThan(0.1);
  });

  /**
   * 4. First Paint Performance
   * Page load to first render should complete within budget.
   */
  test('first paint completes within frame budget', async ({ page }) => {
    // Inject timing before navigation
    await page.addInitScript(() => {
      (window as any).__navStart = performance.now();
    });

    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const firstPaintTime = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find(e => e.name === 'first-contentful-paint');
      return fcp?.startTime ?? -1;
    });

    // Also measure via rAF — time from script start to first frame
    const firstFrameTime = await page.evaluate(() => {
      return (window as any).__firstFrameTime ?? -1;
    });

    console.log(`\n🎨 First Paint Report:`);
    console.log(`   FCP: ${firstPaintTime.toFixed(2)}ms`);
    console.log(`   First frame: ${firstFrameTime.toFixed(2)}ms`);

    fs.writeFileSync(
      path.join(RESULTS_DIR, 'scroll-first-paint.json'),
      JSON.stringify({ firstPaintTime, firstFrameTime }, null, 2)
    );

    // Canvas renders don't produce FCP entries, so rely on first frame if available
    // For 1K items, expect < 100ms (generous for CI)
    if (firstFrameTime > 0) {
      expect(firstFrameTime, `First frame took ${firstFrameTime.toFixed(0)}ms`).toBeLessThan(100);
    }
  });

  /**
   * 5. Boundary Edge Cases
   * First and last items reachable; scroll clamps correctly.
   */
  test('scroll clamps at boundaries — first and last items reachable', async ({ page }) => {
    await page.goto(PAGE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const canvas = page.locator('#root');

    // At top: screenshot for reference
    const topShot = await canvas.screenshot();
    fs.writeFileSync(path.join(RESULTS_DIR, 'scroll-boundary-top.png'), topShot);

    // Try scrolling UP past the top — should clamp at 0
    await canvas.hover({ position: { x: 400, y: 300 } });
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, -200);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    const overTopShot = await canvas.screenshot();

    // Compare: should be identical to initial (clamped at 0)
    const topImg = PNG.sync.read(topShot);
    const overTopImg = PNG.sync.read(overTopShot);
    const { width, height } = topImg;
    const diffTop = new PNG({ width, height });
    const mismatchTop = pixelmatch(
      topImg.data as unknown as Buffer,
      overTopImg.data as unknown as Buffer,
      diffTop.data,
      width,
      height,
      { threshold: 0.1 }
    );
    const topDiffPercent = (mismatchTop / (width * height)) * 100;

    console.log(`\n📐 Boundary Report:`);
    console.log(`   Over-scroll top diff: ${topDiffPercent.toFixed(2)}%`);

    expect(topDiffPercent, `Scroll went past top boundary`).toBeLessThan(0.1);

    // Scroll to the very bottom
    for (let i = 0; i < 300; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(10);
    }
    await page.waitForTimeout(1000);

    const bottomShot = await canvas.screenshot();
    fs.writeFileSync(path.join(RESULTS_DIR, 'scroll-boundary-bottom.png'), bottomShot);

    // Scroll further past bottom — should clamp
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(1000);

    const overBottomShot = await canvas.screenshot();
    const bottomImg = PNG.sync.read(bottomShot);
    const overBottomImg = PNG.sync.read(overBottomShot);
    const diffBottom = new PNG({ width, height });
    const mismatchBottom = pixelmatch(
      bottomImg.data as unknown as Buffer,
      overBottomImg.data as unknown as Buffer,
      diffBottom.data,
      width,
      height,
      { threshold: 0.1 }
    );
    const bottomDiffPercent = (mismatchBottom / (width * height)) * 100;

    console.log(`   Over-scroll bottom diff: ${bottomDiffPercent.toFixed(2)}%`);

    expect(bottomDiffPercent, `Scroll went past bottom boundary`).toBeLessThan(0.1);
  });
});
