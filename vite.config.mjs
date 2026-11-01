import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'build',
    sourcemap: true,
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks stay cached across app deploys
        codeSplitting: {
          groups: [
            { name: 'leaflet', test: /node_modules[\\/](leaflet|react-leaflet|@react-leaflet|react-leaflet-drift-marker)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/ },
            { name: 'bootstrap', test: /node_modules[\\/](react-bootstrap|@restart|@popperjs|@react-aria|dom-helpers)[\\/]/ },
            { name: 'faro', test: /node_modules[\\/](@grafana|@opentelemetry)[\\/]/ },
          ],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
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
