import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

/** 构建 ESM 产物；Vue 与 TDesign 由集成基座或宿主统一提供。 */
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  server: {
    proxy: {
      // 账号与两票同属一个后端服务，复用 two-ticket 服务前缀代理。
      '/api/two-ticket': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/two-ticket/, '')
      }
    }
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: (format) => `account-management.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'tdesign-vue-next']
    }
  }
})
