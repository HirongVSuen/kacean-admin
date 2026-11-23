import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

/** 构建 ESM / UMD 双产物；Vue 与 TDesign 由集成基座统一提供。 */
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  server: {
    proxy: {
      // 数据字典与账号、两票同属一个后端服务，复用 two-ticket 服务前缀代理。
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
      name: 'DataDictManagement',
      formats: ['es', 'umd'],
      fileName: (format) => `data-dict-management.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'tdesign-vue-next'],
      output: {
        globals: {
          vue: 'Vue',
          'tdesign-vue-next': 'TDesign'
        }
      }
    }
  }
})
