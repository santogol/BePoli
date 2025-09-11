import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/login': 'http://localhost:3000',
      '/register': 'http://localhost:3000',
      '/logout': 'http://localhost:3000',
      '/csrf-token': 'http://localhost:3000',
      '/auth': 'http://localhost:3000'
    }
  }
})

