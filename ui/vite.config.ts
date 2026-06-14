// allows reference to test property provided by vitest
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8806',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    // avoids the need to import `describe`, `it`, `expect` etc. in each test file
    globals: true,
    // runs inside each worker (test file) after globals are set up, so jest-dom can extend `expect`
    setupFiles: ['./src/test/setup.ts'],
  },
})
