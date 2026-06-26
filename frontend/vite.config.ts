import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true, // Listen on all local IPs
    port: 5173,
    // Remove strictPort and hmr blocks for a second to let Vite auto-detect
    watch: {
      usePolling: true,
      ignored: ['**/node_modules/**', '**/dist/**'],
    }
  },
})