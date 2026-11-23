import type { AdminModuleManifest } from '@kacean/types'
import Dashboard from './views/Dashboard'
import Organizations from './views/Organizations'
import Settings from './views/Settings'
import Users from './views/Users'

/** shell 内置页面与菜单，与业务模块走同一聚合管线 */
export const shellManifest: AdminModuleManifest = {
  name: 'shell',
  // 与 shell package.json 的 version 保持一致
  version: '0.0.0',
  menus: [
    { path: '/dashboard', title: '工作台', icon: 'dashboard', group: '操作空间', order: 0 },
    { path: '/system/users', title: '用户管理', icon: 'user', group: '系统管理', order: 90 },
    { path: '/system/organizations', title: '组织管理', icon: 'organization', group: '系统管理', order: 91 },
    { path: '/settings', title: '系统设置', icon: 'setting', group: '系统管理', order: 100 }
  ],
  routes: [
    { path: '/dashboard', component: Dashboard },
    { path: '/system/users', component: Users },
    { path: '/system/organizations', component: Organizations },
    { path: '/settings', component: Settings }
  ]
}
