import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const GITHUB_PAGES_BASE_URL = '/shopping-cart-full-stack/'

// https://vite.dev/config/
export default defineConfig({
  base: GITHUB_PAGES_BASE_URL,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
