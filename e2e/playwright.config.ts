import { defineConfig } from '@playwright/test';
import { resolve } from 'path';

const projectRoot = resolve(__dirname, '..');

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 60_000,
  retries: 0,
  use: {
    browserName: 'chromium',
    headless: true,
    viewport: { width: 800, height: 600 },
    deviceScaleFactor: 1,
    launchOptions: {
      executablePath: '/home/wenshegnxu/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell',
      args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      env: {
        ...process.env,
        LD_LIBRARY_PATH: `/home/wenshegnxu/lib:${process.env.LD_LIBRARY_PATH || ''}`,
      },
    },
  },
  webServer: {
    command: 'npx vite --config e2e/vite.e2e.config.ts --port 5173',
    port: 5173,
    timeout: 30_000,
    reuseExistingServer: true,
    cwd: projectRoot,
  },
});
