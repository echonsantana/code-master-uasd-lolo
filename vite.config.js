/*import { defineConfig } from 'vite'

export default defineConfig({
  root: './', // opcional
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  },
  // plugins: []  <-- aquí solo van plugins que realmente uses NO VA
  base: '/code-master-uasd-lolo/',
})
*/

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: './',
  base: '/code-master-uasd-lolo/',

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reservas: resolve(__dirname, 'reservas.html'),
        admin: resolve(__dirname, 'admin.html'),
      }
    }
  }
})
