import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'

/**
 * 双产物构建：
 * - ESM（demo-module.es.js）：供支持 ESM 的集成方使用
 * - UMD（demo-module.umd.js）：挂 window.DemoModule，供 shell 的 UMD 模块加载器远程加载
 * vue / tdesign-vue-next 外部化，由基座统一提供（TDesign 全局注入）
 */
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DemoModule',
      formats: ['es', 'umd'],
      fileName: (format) => `demo-module.${format}.js`
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
