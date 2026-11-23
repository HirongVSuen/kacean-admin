import type { AdminModuleManifest } from '@kacean/types'

/** 数据字典管理模块只声明页面路由；菜单与权限由 shell Provider 统一提供。 */
export const manifest: AdminModuleManifest = {
  name: 'data-dict-management',
  version: '0.0.0',
  routes: [{ path: '/data-dict-management', component: () => import('./views/DataDictManagement') }]
}
