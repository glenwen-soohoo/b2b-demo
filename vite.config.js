import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/b2b-demo/',
  define: {
    // Exposes Vite's base URL as a global so config.js can pick it up without import.meta
    __VITE_BASE_URL__: JSON.stringify('/b2b-demo/'),
  },
})
