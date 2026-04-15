/**
 * Generate screenshots for all demos using Playwright.
 * Run: node --loader ts-node/esm docs/demos/generate-screenshots.ts
 * Or via the npm script: npm run screenshots -w docs
 */
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const demos = ['dashboard', 'tailwind', 'form', 'image'];

async function main() {
  // Start a Vite dev server to serve demos
  const server = await createServer({
    root: resolve(__dirname, '..'),
    configFile: resolve(__dirname, '..', 'vite.config.ts'),
    server: { port: 5199 },
    publicDir: false,
  });
  await server.listen();

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
    args: ['--no-sandbox'],
  });

  const outDir = resolve(__dirname, '..', 'public', 'demos', 'screenshots');
  mkdirSync(outDir, { recursive: true });

  for (const name of demos) {
    const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
    await page.goto(`http://localhost:5199/demos/${name}.html`, { waitUntil: 'networkidle' });
    // Wait for canvas render + images
    await page.waitForTimeout(1500);
    await page.screenshot({ path: resolve(outDir, `${name}.png`) });
    await page.close();
    console.log(`✓ ${name}.png`);
  }

  await browser.close();
  await server.close();
}

main().catch(console.error);
