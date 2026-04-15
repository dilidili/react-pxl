import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for E2E test fixtures.
 * Serves both dom-page.html and pxl-page.html with proper aliases.
 */
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'fixtures'),
  resolve: {
    alias: {
      '@react-pxl/core': resolve(__dirname, '../packages/core/src'),
      '@react-pxl/reconciler': resolve(__dirname, '../packages/reconciler/src'),
      '@react-pxl/layout': resolve(__dirname, '../packages/layout/src'),
      '@react-pxl/renderer': resolve(__dirname, '../packages/renderer/src'),
      '@react-pxl/events': resolve(__dirname, '../packages/events/src'),
      '@react-pxl/components': resolve(__dirname, '../packages/components/src'),
    },
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react-reconciler'],
    exclude: ['yoga-wasm-web'],
  },
});
