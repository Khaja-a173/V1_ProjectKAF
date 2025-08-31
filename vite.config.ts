import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Helper for ESM-friendly path resolution
const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],

  // Path aliases used across the app (matches tsconfig.json)
  resolve: {
    alias: {
      '@': r('./src'),
    },
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Dev-only convenience if you ever call fetch('/api/...') in the UI
      '/api': {
        target: 'http://localhost:8090', // Server runs on 8090 per project snapshot
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});