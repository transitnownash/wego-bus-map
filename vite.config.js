import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  server: {
    port: Number(process.env.PORT) || 3001,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js', // stays .js — no JSX
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
    server: {
      deps: {
        // These packages ship ESM-only or have UMD context issues in Vitest
        inline: ['react-leaflet', '@react-leaflet', 'leaflet', 'react-router-dom', 'react-router', '@remix-run/router'],
      },
    },
    // Mirror the CRA timezone used in tests
    env: {
      TZ: 'America/Chicago',
    },
  },
});
