import type { AdminModuleManifest, ModuleMenuItem } from '@kacean/types'

const permission = 'template-module:view'

const pageMenus: ModuleMenuItem[] = [
  { path: '/template-module/table', title: '基础表格', icon: 'list', order: 0 },
  { path: '/template-module/pagination', title: '分页组件', icon: 'list', order: 1 },
  { path: '/template-module/table-pagination', title: '分页表格', icon: 'list', order: 2 },
  { path: '/template-module/step-form', title: '分步表单', icon: 'app', order: 3 },
  { path: '/template-module/section-form', title: '分块表单', icon: 'app', order: 4 },
  { path: '/template-module/dates', title: '日期选择', icon: 'app', order: 5 },
  { path: '/template-module/dialogs', title: '弹框组件', icon: 'app', order: 6 },
  { path: '/template-module/detail', title: '详情布局', icon: 'layers', order: 7 },
  { path: '/template-module/tree', title: '树形组件', icon: 'layers', order: 8 },
  { path: '/template-module/dock-panel', title: 'Dock 面板', icon: 'layers', order: 9 }
]

/** 常用后台页面模板：菜单与路由同源，所有数据均为模块内静态示例。 */
export const manifest: AdminModuleManifest = {
  name: 'template-module',
  version: '0.0.0',
  permissions: [permission],
  menus: [
    {
      path: '/template-module',
      title: '模板展示',
      icon: 'app',
      group: '操作空间',
      order: 20,
      permission,
      children: pageMenus.map((item) => ({ ...item, permission }))
    }
  ],
  routes: [
    { path: '/template-module/table', component: () => import('./views/TableExamples') },
    { path: '/template-module/pagination', component: () => import('./views/PaginationExamples') },
    { path: '/template-module/table-pagination', component: () => import('./views/PaginatedTable') },
    { path: '/template-module/step-form', component: () => import('./views/StepForm') },
    { path: '/template-module/section-form', component: () => import('./views/SectionForm') },
    { path: '/template-module/dates', component: () => import('./views/DateExamples') },
    { path: '/template-module/dialogs', component: () => import('./views/DialogExamples') },
    { path: '/template-module/detail', component: () => import('./views/DetailLayout') },
    { path: '/template-module/tree', component: () => import('./views/TreeExamples') },
    { path: '/template-module/dock-panel', component: () => import('./views/DockPanel') }
  ]
}
