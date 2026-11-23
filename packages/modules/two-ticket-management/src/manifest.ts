import type { AdminModuleManifest } from '@kacean/types'

/** 两票管理模块只声明页面路由；菜单与权限由 shell Provider 统一提供。 */
export const manifest: AdminModuleManifest = {
  name: 'two-ticket-management',
  version: '0.0.0',
  routes: [
    { path: '/two-ticket-management', component: () => import('./views/TwoTicketManagement') },
    { path: '/two-ticket-management/ticket-types', component: () => import('./views/TicketTypeManagement') }
  ]
}
