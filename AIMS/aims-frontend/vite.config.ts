import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use
  },
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    allowedHosts: [
      'aims-frontend-cxhp.onrender.com',
      'localhost',
      '.onrender.com', // Allow all Render.com subdomains
    ],
  },
})
