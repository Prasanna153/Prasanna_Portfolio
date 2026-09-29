import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the React app (port 5173) talks to the Express API (port 3001).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
      '/resume': 'http://localhost:3001',
    },
  },
})
