/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GAP-05: el backend no configura CORS. En desarrollo Vite actúa como proxy:
// el navegador llama a /api (mismo origen) y Vite reenvía a Spring Boot.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const destino = env.VITE_API_PROXY ?? 'http://localhost:8080'
  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: { '/api': { target: destino, changeOrigin: true } },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/pruebas/setup.ts'],
      css: false,
    },
  }
})
