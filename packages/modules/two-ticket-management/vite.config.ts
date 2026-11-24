import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

/** 构建 ESM 产物；Vue 与 TDesign 由集成基座或宿主统一提供。 */
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  server: {
    proxy: {
      '/api': {
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
      fileName: (format) => `two-ticket-management.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'tdesign-vue-next']
    }
  }
})
