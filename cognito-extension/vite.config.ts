import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  // Set base to './' for relative paths in Chrome extensions
  base: './',
  plugins: [
    react(),
    crx({
      manifest,
    }),
  ],
  server: {
    port: 5173,
    strictPort: true, 
    hmr: {
      clientPort: 5173,
    },
  },
  build: {
    rollupOptions: {
      input: {
        languageModelInterceptor: 'src/languageModelInterceptor.ts',
      },
    },
  },
})