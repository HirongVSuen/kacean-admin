import type { AdminModuleManifest } from '@kacean/types'
import Dashboard from './views/Dashboard'
import Settings from './views/Settings'

/** shell 内置页面与菜单，与业务模块走同一聚合管线 */
export const shellManifest: AdminModuleManifest = {
  name: 'shell',
  menus: [
    { path: '/dashboard', title: '工作台', icon: 'dashboard', order: 0 },
    { path: '/settings', title: '系统设置', icon: 'setting', order: 100 }
  ],
  routes: [
    { path: '/dashboard', component: Dashboard },
    { path: '/settings', component: Settings }
  ]
}
