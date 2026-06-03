/**
 * QUANTUM COMPLIANCE OS™ — vite.config.js
 * Run 8: Production deployment configuration.
 * Static SPA build. No backend. No SSR. No API routes.
 * Compatible with Vercel, Netlify, GitHub Pages, and any static host.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    assetsInlineLimit: 4096,
    // Raise warning threshold — this is a large single-page app by design
    chunkSizeWarningLimit: 800,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        chunkFileNames:  'assets/[name]-[hash].js',
        entryFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
    },
  },

  server: {
    port: 5173,
    open: false,
    historyApiFallback: true,
  },

  preview: {
    port: 4173,
    open: false,
  },

  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
