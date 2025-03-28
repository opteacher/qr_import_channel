import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), basicSsl()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib/frontend-library/src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '^/qr_fountain_channel/(mdl|api|job)': {
        target: 'http://192.168.1.11:4009',
        ws: true,
        changeOrigin: true
      },
      '^/qr-fountain-channel': {
        target: 'http://192.168.1.11:9000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
