import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['packages/**/src/**/*.test.ts', 'packages/**/src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@react-pxl/core': resolve(__dirname, 'packages/core/src'),
      '@react-pxl/reconciler': resolve(__dirname, 'packages/reconciler/src'),
      '@react-pxl/layout': resolve(__dirname, 'packages/layout/src'),
      '@react-pxl/renderer': resolve(__dirname, 'packages/renderer/src'),
      '@react-pxl/events': resolve(__dirname, 'packages/events/src'),
      '@react-pxl/components': resolve(__dirname, 'packages/components/src'),
      '@react-pxl/ai-bridge': resolve(__dirname, 'packages/ai-bridge/src'),
    },
  },
});
