import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:8777',
      '/create': 'http://localhost:8777',
      '/generate-otp': 'http://localhost:8777',
      '/reset': 'http://localhost:8777'
    }
  }
})
