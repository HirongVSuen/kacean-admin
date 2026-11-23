export type MenuType = '目录' | '菜单' | '按钮'
export type MenuVisibility = '显示' | '隐藏'

export interface MenuRecord {
  id: string
  title: string
  parentTitle: string
  path: string
  permission: string
  type: MenuType
  order: number
  visibility: MenuVisibility
}

/** 本地静态菜单数据，仅用于模块页面与筛选分页交互。 */
export const menuRows: MenuRecord[] = [
  {
    id: 'MENU-001',
    title: '操作空间',
    parentTitle: '根目录',
    path: '/workspace',
    permission: '-',
    type: '目录',
    order: 10,
    visibility: '显示'
  },
  {
    id: 'MENU-002',
    title: '工作台',
    parentTitle: '操作空间',
    path: '/dashboard',
    permission: 'dashboard:view',
    type: '菜单',
    order: 10,
    visibility: '显示'
  },
  {
    id: 'MENU-003',
    title: '两票管理',
    parentTitle: '操作空间',
    path: '/two-ticket-management',
    permission: 'two-ticket-management:view',
    type: '菜单',
    order: 20,
    visibility: '显示'
  },
  {
    id: 'MENU-004',
    title: '新建工作票',
    parentTitle: '两票管理',
    path: '-',
    permission: 'two-ticket-management:work:create',
    type: '按钮',
    order: 10,
    visibility: '显示'
  },
  {
    id: 'MENU-005',
    title: '新建操作票',
    parentTitle: '两票管理',
    path: '-',
    permission: 'two-ticket-management:operation:create',
    type: '按钮',
    order: 20,
    visibility: '显示'
  },
  {
    id: 'MENU-006',
    title: '模板展示',
    parentTitle: '操作空间',
    path: '/template-module',
    permission: 'template-module:view',
    type: '目录',
    order: 30,
    visibility: '显示'
  },
  {
    id: 'MENU-007',
    title: '系统管理',
    parentTitle: '根目录',
    path: '/system',
    permission: '-',
    type: '目录',
    order: 20,
    visibility: '显示'
  },
  {
    id: 'MENU-008',
    title: '账号管理',
    parentTitle: '系统管理',
    path: '/account-management',
    permission: 'account-management:view',
    type: '菜单',
    order: 10,
    visibility: '显示'
  },
  {
    id: 'MENU-009',
    title: '新增账号',
    parentTitle: '账号管理',
    path: '-',
    permission: 'account-management:create',
    type: '按钮',
    order: 10,
    visibility: '显示'
  },
  {
    id: 'MENU-010',
    title: '菜单管理',
    parentTitle: '系统管理',
    path: '/menu-management',
    permission: 'menu-management:view',
    type: '菜单',
    order: 20,
    visibility: '显示'
  },
  {
    id: 'MENU-011',
    title: '菜单排序',
    parentTitle: '菜单管理',
    path: '-',
    permission: 'menu-management:sort',
    type: '按钮',
    order: 10,
    visibility: '隐藏'
  },
  {
    id: 'MENU-012',
    title: '历史菜单',
    parentTitle: '系统管理',
    path: '/legacy-menu',
    permission: 'legacy-menu:view',
    type: '菜单',
    order: 90,
    visibility: '隐藏'
  }
]
