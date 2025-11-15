import { defineConfig } from 'vite'

export default defineConfig({
  root: './', // opcional
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  },
  // plugins: []  <-- aquí solo van plugins que realmente uses
})
