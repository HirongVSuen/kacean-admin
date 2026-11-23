import { createApp } from 'vue'
// 组件在 TSX 中具名导入使用，不做 app.use 全量注册，保证 tree-shaking
// 样式暂时全量引入（后续可按需引入收敛体积）
import 'tdesign-vue-next/es/style/index.css'
import './styles/theme.css'
import 'virtual:uno.css'
import { HTTP_CLIENT_FACTORY_KEY } from '@kacean/common'
import App from './App'
import { kernelReady } from './kernel'
import { httpClientFactory } from './providers/http'
import { createShellRouter } from './router'

async function bootstrap() {
  // 等待模块清单加载与注册编排完成，再创建路由、挂载应用
  await kernelReady
  createApp(App)
    .use(createShellRouter())
    // 统一注入 HttpClient 工厂：模块按逻辑服务 key 创建 client，鉴权空实现见 providers/http.ts
    .provide(HTTP_CLIENT_FACTORY_KEY, httpClientFactory)
    .mount('#app')
}

bootstrap().catch((error: unknown) => {
  console.error('[shell] 启动失败：模块清单加载或契约校验未通过', error)
})
