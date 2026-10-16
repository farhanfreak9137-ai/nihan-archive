import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    host: true,
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/Updates/**', '**/public/media/**', '**/android/**', '**/dist/**'],
    },
  },
});
