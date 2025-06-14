import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 서버 주소
        changeOrigin: true,
        secure: false,
      },
      '/vworld': {
        target: 'https://api.vworld.kr',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/vworld/, '')
      }
    },
  },
})
