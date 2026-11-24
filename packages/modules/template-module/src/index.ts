// 模块示例样式随源码入口引入，保证 shell 静态集成时间距、布局等样式生效
import './styles.css'
import { defineModule } from '@kacean/module/self'
import { TEMPLATE_PERMISSION, templateMenus } from './menus'

/** 常用后台页面纯静态模板：菜单与路由同源，所有用例仅使用本地 mock。 */
export const { manifest } = defineModule({
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
})
