import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // maplibre-gl spawns its own worker with `new URL(...)`; Vite's dep pre-bundling
  // rewrites that URL and the worker 404s in dev only.
  optimizeDeps: { exclude: ['maplibre-gl'] },
  build: { chunkSizeWarningLimit: 1200 },
  worker: { format: 'es' },
})