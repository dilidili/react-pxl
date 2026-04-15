import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@react-pxl/core': resolve(__dirname, '../../packages/core/src'),
      '@react-pxl/reconciler': resolve(__dirname, '../../packages/reconciler/src'),
      '@react-pxl/layout': resolve(__dirname, '../../packages/layout/src'),
      '@react-pxl/renderer': resolve(__dirname, '../../packages/renderer/src'),
      '@react-pxl/events': resolve(__dirname, '../../packages/events/src'),
      '@react-pxl/components': resolve(__dirname, '../../packages/components/src'),
    },
  },
});
