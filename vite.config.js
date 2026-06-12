import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/testing/setup.js',
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      exclude: ['e2e/**', 'node_modules/**', 'src/testing/**'],
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
})
