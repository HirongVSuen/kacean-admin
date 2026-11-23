import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

/** 构建 ESM / UMD 双产物；Vue 与 TDesign 由集成基座统一提供。 */
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'TemplateModule',
      formats: ['es', 'umd'],
      fileName: (format) => `template-module.${format}.js`
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
