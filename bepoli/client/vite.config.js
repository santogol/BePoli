import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // opzionale: inoltra /api al tuo Express in dev
      '/api': 'http://localhost:3000'
    }
  }
})
