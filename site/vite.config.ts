import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/svg-interactive/',
  resolve: {
    alias: [
      {
        find: 'svg-interactive/styles',
        replacement: path.resolve(__dirname, '../src/styles/themes.css')
      },
      {
        find: 'svg-interactive',
        replacement: path.resolve(__dirname, '../src')
      },
      {
        find: '@examples',
        replacement: path.resolve(__dirname, '../examples')
      }
    ]
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
