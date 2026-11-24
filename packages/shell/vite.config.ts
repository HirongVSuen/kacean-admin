import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { moduleRegistry } from '@kacean/module/vite'

/** 统一规范化为 '/admin/' 形式；空值或根路径保持 '/'。 */
function normalizeBasePath(value?: string): string {
  const path = value?.trim().replace(/^\/+|\/+$/g, '')
  return path ? `/${path}/` : '/'
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')

  return {
    // 各 mode 的默认二级路径与产物目录分别在 .env.<mode> 中维护。
    base: normalizeBasePath(env.VITE_APP_BASE_PATH),
    build: {
      outDir: env.VITE_BUILD_OUT_DIR?.trim() || 'dist'
    },
    resolve: {
      // pnpm 可能按 TypeScript peer 解析出多份实例，Router 与 RouterView 必须共享同一套注入键。
      dedupe: ['vue', 'vue-router']
    },
    plugins: [moduleRegistry({ mode, developmentModule: env.VITE_DEV_MODULE }), vue(), vueJsx(), UnoCSS()],
    server: {
      proxy: {
        // 避免本地后端未开放 CORS 时浏览器无法联调；部署环境可通过服务目录覆盖 baseURL。
        '/api/two-ticket': {
          target: env.VITE_TWO_TICKET_PROXY_TARGET ?? 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/two-ticket/, '')
        }
      }
    }
  }
})
