import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testing/setup.js',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
