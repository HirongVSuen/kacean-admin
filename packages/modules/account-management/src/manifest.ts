import type { AdminModuleManifest } from '@kacean/types'

/** 账号管理模块只声明页面路由；菜单与权限由 shell Provider 统一提供。 */
export const manifest: AdminModuleManifest = {
  name: 'account-management',
  version: '0.0.0',
  routes: [{ path: '/account-management', component: () => import('./views/AccountManagement') }]
}
