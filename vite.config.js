import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

// Vite configuration disabling minification and code splitting for a single bundle
export default defineConfig({
  plugins: [react(), visualizer({ title: 'Bundle analysis', open: true })],
  build: {
    minify: false,
    cssMinify: false,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Disable manual chunking to keep a single bundle
        manualChunks: undefined,
      },
    },
    // Disable code splitting (inlineDynamicImports is deprecated, Vite uses codeSplitting)
    codeSplitting: false,
  },
});
