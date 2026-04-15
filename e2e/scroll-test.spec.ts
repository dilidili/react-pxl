import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.resolve(__dirname, '../validation-results');

test.describe('Scroll: react-pxl canvas scroll containers', () => {

  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  });

  test('should scroll content when receiving wheel events', async ({ page }) => {
    await page.goto('http://localhost:5173/scroll-pxl-page.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const canvas = page.locator('#root');

    // Screenshot before scroll
    const beforeShot = await canvas.screenshot();
    const beforePath = path.join(RESULTS_DIR, 'scroll-before.png');
    fs.writeFileSync(beforePath, beforeShot);

    // Send multiple wheel events to scroll down significantly
    await canvas.hover({ position: { x: 400, y: 400 } });
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(100);
    }
    // Wait for final re-render
    await page.waitForTimeout(500);

    // Screenshot after scroll
    const afterShot = await canvas.screenshot();
    const afterPath = path.join(RESULTS_DIR, 'scroll-after.png');
    fs.writeFileSync(afterPath, afterShot);

    // Compare — the images MUST differ (content scrolled)
    const beforeImg = PNG.sync.read(beforeShot);
    const afterImg = PNG.sync.read(afterShot);

    const width = beforeImg.width;
    const height = beforeImg.height;
    const diff = new PNG({ width, height });

    const mismatchedPixels = pixelmatch(
      beforeImg.data as unknown as Buffer,
      afterImg.data as unknown as Buffer,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const diffPath = path.join(RESULTS_DIR, 'scroll-diff.png');
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const diffPercent = (mismatchedPixels / totalPixels) * 100;

    console.log(`\n📜 Scroll Test Report:`);
    console.log(`   Before/After diff: ${mismatchedPixels}/${totalPixels} pixels (${diffPercent.toFixed(2)}%)`);
    console.log(`   Artifacts: ${RESULTS_DIR}/scroll-*.png`);

    // The scrolled view must differ from the initial view
    // (items moved up, new items appeared at bottom)
    expect(diffPercent, `Scroll did not change canvas content (${diffPercent.toFixed(2)}%)`).toBeGreaterThan(0.5);
  });
});
