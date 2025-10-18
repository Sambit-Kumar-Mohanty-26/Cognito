// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'

// We import the manifest file to use it in the config
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  // This server configuration is the definitive fix for HMR in Chrome Extensions.
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      // We are telling the HMR client to connect to this exact port
      clientPort: 5173,
      // CRITICAL: We are forcing the host to be the explicit IP address
      // This is often required for Chrome extensions to bypass certain security checks.
      host: '127.0.0.1',
    },
  },
})