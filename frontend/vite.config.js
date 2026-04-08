import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API = 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 5173,
    proxy: {
      '/upload': { target: API, changeOrigin: true },
      '/chat': { target: API, changeOrigin: true },
      '/api': { target: API, changeOrigin: true },
      '/health': { target: API, changeOrigin: true },
      '/cache': { target: API, changeOrigin: true },
    },
  },
});
