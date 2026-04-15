import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import * as fs from 'fs';
import * as path from 'path';

const RESULTS_DIR = path.resolve(__dirname, '../validation-results');
const TOLERANCE = 0.05; // 5% pixel difference allowed

test.describe('Visual Fidelity: react-dom vs react-pxl', () => {

  test.beforeAll(() => {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  });

  test('should render similar output for the same component', async ({ page }) => {
    // --- Step 1: Screenshot react-dom baseline ---
    await page.goto('http://localhost:5173/dom-page.html');
    await page.waitForLoadState('networkidle');
    // Wait for React to render
    await page.waitForTimeout(1000);

    const domScreenshot = await page.locator('#root').screenshot();
    const domPath = path.join(RESULTS_DIR, 'dom-baseline.png');
    fs.writeFileSync(domPath, domScreenshot);

    // --- Step 2: Screenshot react-pxl output ---
    await page.goto('http://localhost:5173/pxl-page.html');
    await page.waitForLoadState('networkidle');
    // Wait for canvas render + Yoga WASM init
    await page.waitForTimeout(2000);

    const pxlScreenshot = await page.locator('#root').screenshot();
    const pxlPath = path.join(RESULTS_DIR, 'pxl-output.png');
    fs.writeFileSync(pxlPath, pxlScreenshot);

    // --- Step 3: Compare with pixelmatch ---
    const domImg = PNG.sync.read(domScreenshot);
    const pxlImg = PNG.sync.read(pxlScreenshot);

    // Ensure same dimensions
    const width = Math.min(domImg.width, pxlImg.width);
    const height = Math.min(domImg.height, pxlImg.height);

    // Resize to match if needed
    const domData = cropImageData(domImg, width, height);
    const pxlData = cropImageData(pxlImg, width, height);

    const diff = new PNG({ width, height });
    const mismatchedPixels = pixelmatch(
      domData,
      pxlData,
      diff.data,
      width,
      height,
      { threshold: 0.3 } // per-pixel color threshold (anti-aliasing tolerance)
    );

    const totalPixels = width * height;
    const diffPercent = mismatchedPixels / totalPixels;
    const diffPercentStr = (diffPercent * 100).toFixed(2);

    // Save diff image
    const diffPath = path.join(RESULTS_DIR, 'diff.png');
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    // --- Step 4: Save report ---
    const report = {
      timestamp: new Date().toISOString(),
      dimensions: { width, height },
      totalPixels,
      mismatchedPixels,
      diffPercent: parseFloat(diffPercentStr),
      tolerance: TOLERANCE * 100,
      passed: diffPercent <= TOLERANCE,
      files: {
        domBaseline: 'dom-baseline.png',
        pxlOutput: 'pxl-output.png',
        diffImage: 'diff.png',
      },
    };

    const reportPath = path.join(RESULTS_DIR, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Visual Diff Report:`);
    console.log(`   Dimensions: ${width}x${height}`);
    console.log(`   Mismatched: ${mismatchedPixels}/${totalPixels} pixels (${diffPercentStr}%)`);
    console.log(`   Tolerance:  ${TOLERANCE * 100}%`);
    console.log(`   Result:     ${report.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Artifacts:  ${RESULTS_DIR}/`);

    // Assert within tolerance
    expect(diffPercent, `Visual diff ${diffPercentStr}% exceeds ${TOLERANCE * 100}% tolerance`).toBeLessThanOrEqual(TOLERANCE);
  });
});

/** Crop image data to target dimensions */
function cropImageData(img: PNG, targetWidth: number, targetHeight: number): Buffer {
  if (img.width === targetWidth && img.height === targetHeight) {
    return img.data as unknown as Buffer;
  }

  const cropped = Buffer.alloc(targetWidth * targetHeight * 4);
  for (let y = 0; y < targetHeight; y++) {
    const srcOffset = y * img.width * 4;
    const dstOffset = y * targetWidth * 4;
    img.data.copy(cropped, dstOffset, srcOffset, srcOffset + targetWidth * 4);
  }
  return cropped;
}
