import type { Component } from 'vue'

/** 后端接口统一返回结构 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 分页请求参数 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

/** 分页返回结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/** 模块菜单项 */
export interface ModuleMenuItem {
  /** 路由路径，同时作为菜单唯一标识 */
  path: string
  title: string
  /** 图标名，由 shell 统一映射到图标组件，模块不直接依赖图标库 */
  icon?: string
  /** 同级排序，小的在前；缺省按 50 处理 */
  order?: number
  /** 权限码，shell 按当前用户过滤，缺省表示不限制 */
  permission?: string
  /**
   * 顶层菜单的分组标题，例如「操作空间」「系统管理」。
   * 同名分组跨模块合并；分组仅用于导航归类，不参与路由，也不影响子菜单递归。
   */
  group?: string
  children?: ModuleMenuItem[]
}

/** 路由页面组件：Vue 组件或动态 import 懒加载函数（与 vue-router 的 component 字段兼容） */
export type ModuleRouteComponent = Component | (() => Promise<unknown>)

/** 模块路由项 */
export interface ModuleRoute {
  /** 路由路径，与菜单项 path 对应；详情页等可只出现在 routes 中而不进菜单 */
  path: string
  /** 页面组件，推荐 () => import(...) 懒加载 */
  component: ModuleRouteComponent
}

/** 业务模块自描述清单：模块在自身包内导出，由内核注册后聚合 */
export interface AdminModuleManifest {
  /** 模块名，与 packages/modules/<模块名> 目录名一致 */
  name: string
  /** 模块申报的权限码清单，供权限系统分配与注册时契约校验使用 */
  permissions?: string[]
  menus: ModuleMenuItem[]
  /** 模块路由表，与 menus 同源：菜单 path 应有对应路由 */
  routes: ModuleRoute[]
}

/** 当前登录用户 */
export interface AdminUser {
  id: string
  name: string
  /** 权限码列表（推荐约定），'*' 表示全部权限；具体解释权归 PermissionProvider */
  permissions?: string[]
  [key: string]: unknown
}

/** Auth Provider：登录身份。缺省 = 匿名（getCurrentUser 返回 null） */
export interface AuthProvider {
  getCurrentUser(): AdminUser | null | Promise<AdminUser | null>
  login?(...args: unknown[]): Promise<AdminUser>
  logout?(): Promise<void>
}

/** Permission Provider：权限判断。缺省 = 全部放行 */
export interface PermissionProvider {
  hasPermission(permission: string): boolean
}

/** 内核暴露给 Provider 的上下文能力 */
export interface KernelContext {
  hasPermission(permission: string): boolean
  getUser(): AdminUser | null | Promise<AdminUser | null>
}

/** Menu Provider：菜单数据编排过滤。缺省 = 内置实现（权限过滤 + order 排序） */
export interface MenuProvider {
  resolve(manifests: AdminModuleManifest[], ctx: KernelContext): ModuleMenuItem[]
}

/** Layout Provider：布局骨架渲染。不注册 = 无头模式，宿主自行渲染骨架 */
export interface LayoutProvider {
  /** 布局组件，作为路由根组件使用，内部自行渲染菜单与 <RouterView /> */
  component: Component
}

/** Provider 注册中心契约：按 kind 注册对应能力 */
export interface ProviderMap {
  auth: AuthProvider
  permission: PermissionProvider
  menu: MenuProvider
  layout: LayoutProvider
}

export type ProviderKind = keyof ProviderMap
