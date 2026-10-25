/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  // Runtime JSX con traducción (src/i18n). Ruta absoluta para que Vite lo sirva como código fuente
  // y comparta el mismo módulo de idioma que la app (TypeScript usa el alias @plata/i18n solo para los tipos).
  plugins: [react({ jsxImportSource: '/src/i18n' })],
  resolve: { alias: { '@plata/i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)) } },
  server: { port: 5195, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
  },
})
