import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    rollupOptions: {
      // Use cwd to locate index.html (works both on Windows and Linux CI)
      input: resolve(process.cwd(), 'index.html')
    }
  }
});
