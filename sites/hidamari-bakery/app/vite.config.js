import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 公開用ファイルは sites/hidamari-bakery/dist/ に出力（相対パスで動くよう base は './'）
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
  },
});
