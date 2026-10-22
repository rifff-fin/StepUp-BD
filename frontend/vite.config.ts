import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // the 3D chunk is imported lazily: pre-bundle its packages, or the dev server discovers
  // them mid-session and reloads the page
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  build: {
    // the 3D chunk (three + R3F + drei) is loaded lazily on purpose
    chunkSizeWarningLimit: 1100,
  },
  server: {
    port: 5190, // 5173 / 5180 are used by other studio projects
    strictPort: true,
    // Same-origin /api in development, like the Netlify proxy in production
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  preview: {
    port: 5191,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
