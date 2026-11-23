import type { AdminModuleManifest } from '@kacean/types'
import { TEMPLATE_PERMISSION, templateMenus } from './menus'

/** 常用后台页面纯静态模板：菜单与路由同源，所有用例仅使用本地 mock。 */
export const manifest: AdminModuleManifest = {
  name: 'template-module',
  version: '0.0.0',
  permissions: [TEMPLATE_PERMISSION],
  menus: templateMenus,
  routes: [
    { path: '/dashboard', component: () => import('./views/Dashboard') },
    { path: '/template-module/table', component: () => import('./views/TableExamples') },
    { path: '/template-module/pagination', component: () => import('./views/PaginationExamples') },
    { path: '/template-module/table-pagination', component: () => import('./views/DataTableTemplate') },
    { path: '/template-module/step-form', component: () => import('./views/StepForm') },
    { path: '/template-module/section-form', component: () => import('./views/SectionForm') },
    { path: '/template-module/dates', component: () => import('./views/DateExamples') },
    { path: '/template-module/dialogs', component: () => import('./views/DialogExamples') },
    { path: '/template-module/detail', component: () => import('./views/DetailLayout') },
    { path: '/template-module/tree', component: () => import('./views/TreeExamples') },
    { path: '/template-module/dock-panel', component: () => import('./views/DockPanel') }
  ]
}
