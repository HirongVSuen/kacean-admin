import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  server: {
    proxy: {
      // 避免本地后端未开放 CORS 时浏览器无法联调；部署环境可通过服务目录覆盖 baseURL。
      '/api/two-ticket': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/two-ticket/, '')
      }
    }
  }
})
