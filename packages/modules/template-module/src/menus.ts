import type { ModuleMenuItem } from '@kacean/types'

/** 模板模块的静态菜单、分组与权限均由模块自描述，shell 不维护模板菜单。 */
export const TEMPLATE_MENU_GROUP = '操作空间'
export const TEMPLATE_PERMISSION = 'template-module:view'

export const dashboardMenu: ModuleMenuItem = {
  path: '/dashboard',
  title: '工作台',
  icon: 'dashboard',
  group: TEMPLATE_MENU_GROUP,
  order: 0,
  permission: TEMPLATE_PERMISSION
}

export const pageMenus: ModuleMenuItem[] = [
  { path: '/template-module/table', title: '基础表格', icon: 'list', order: 0 },
  { path: '/template-module/pagination', title: '分页组件', icon: 'list', order: 1 },
  { path: '/template-module/table-pagination', title: '数据表格模板', icon: 'list', order: 2 },
  { path: '/template-module/step-form', title: '分步表单', icon: 'app', order: 3 },
  { path: '/template-module/section-form', title: '分块表单', icon: 'app', order: 4 },
  { path: '/template-module/dates', title: '日期选择', icon: 'app', order: 5 },
  { path: '/template-module/dialogs', title: '弹框组件', icon: 'app', order: 6 },
  { path: '/template-module/detail', title: '详情布局', icon: 'layers', order: 7 },
  { path: '/template-module/tree', title: '树形组件', icon: 'layers', order: 8 },
  { path: '/template-module/dock-panel', title: 'Dock 面板', icon: 'layers', order: 9 }
]

export const templateMenus: ModuleMenuItem[] = [
  dashboardMenu,
  {
    path: '/template-module',
    title: '模板展示',
    icon: 'app',
    group: TEMPLATE_MENU_GROUP,
    order: 20,
    permission: TEMPLATE_PERMISSION,
    children: pageMenus.map((item) => ({ ...item, permission: TEMPLATE_PERMISSION }))
  }
]
