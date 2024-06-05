import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { URL, fileURLToPath } from 'node:url'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@lib': fileURLToPath(new URL('./src/lib/frontend-library/src', import.meta.url))
    }
  },
  server: {
    port: 5174,
    proxy: {
      '^/qr_fountain_channel/(mdl|api|job)': {
        target: 'http://218.242.30.111:6031',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
