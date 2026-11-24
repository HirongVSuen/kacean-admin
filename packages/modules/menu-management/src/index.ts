// 模块样式随源码入口引入，保证 shell 静态集成与独立构建表现一致。
import './styles.css'
import { defineModule } from '@kacean/module/self'

/** 菜单管理模块只声明页面路由；菜单与权限由 shell Provider 统一提供。 */
export const { manifest } = defineModule({
  routes: [{ path: '/menu-management', component: () => import('./views/MenuManagement') }]
})
