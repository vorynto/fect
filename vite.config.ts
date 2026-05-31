import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Build directly to repo root so Hostinger serves compiled files
    outDir: './',
    emptyOutDir: false,
  },
})
