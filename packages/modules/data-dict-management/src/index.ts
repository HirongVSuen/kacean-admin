// 模块样式随源码入口引入，保证 shell 静态集成与独立构建表现一致。
import './styles.css'
import { defineModule } from '@kacean/module/self'

/** 身份与 HTTP 默认配置来自 package.json；菜单与权限由 shell Provider 统一提供。 */
export const { manifest, http } = defineModule({
  routes: [{ path: '/data-dict-management', component: () => import('./views/DataDictManagement') }]
})
