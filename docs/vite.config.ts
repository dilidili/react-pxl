import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const demos = ['profile-pxl', 'profile-dom', 'scroll'];

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  base: '/demos/',
  optimizeDeps: {
    exclude: ['yoga-wasm-web'],
  },
  build: {
    outDir: resolve(__dirname, 'public/demos'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        demos.map(name => [name, resolve(__dirname, `demos/${name}.html`)])
      ),
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
