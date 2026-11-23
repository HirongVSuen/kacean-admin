import type { Component } from 'vue'

/**
 * 后端接口统一返回结构（对应后端 Result<T>）。
 * 成功码固定为 '0'（common 导出 SUCCESS_CODE），业务错误码为非空白字符串且不得复用成功码；
 * 参数校验失败统一为 'VALIDATION_ERROR'（VALIDATION_ERROR_CODE），此时 data 可携带具体错误详情。
 */
export interface ApiResponse<T = unknown> {
  /** 响应码，非空白；成功为 '0' */
  code: string
  /** 响应说明，非空白 */
  message: string
  /** 响应数据，无数据时为 null */
  data: T | null
}

/** 排序方向（对应后端 SortDirection） */
export type SortDirection = 'ASC' | 'DESC'

/** 排序条件（对应后端 Sort）：field 为后端持久化属性名，由后端解析为真实列，前端不做 SQL 拼接 */
export interface Sort {
  field: string
  direction: SortDirection
}

/**
 * 业务查询参数基类（对应后端 Query）：统一承载关键字与排序参数。
 * 具体模块通过扩展该接口声明自己的过滤字段，未声明字段的匹配规则由后端查询声明决定。
 */
export interface Query {
  /** 查询关键字，为空表示不做关键字匹配 */
  keyword?: string
  /** 排序规则，按列表顺序依次排序；为空表示不指定排序 */
  sorts?: Sort[]
}

/**
 * 分页查询（对应后端 PageQuery<Q>）：组合业务查询参数、页码与页大小。
 * pageNum 从 1 开始；pageSize 取值 1 ~ 200（上限见 common 的 MAX_PAGE_SIZE）。
 */
export interface PageQuery<Q extends Query = Query> {
  /** 业务查询参数，非空 */
  query: Q
  pageNum: number
  pageSize: number
}

/**
 * 分页结果（对应后端 PageResult<T>）：仅表达响应。
 * 总页数由 total 与 pageSize 派生计算（见 common 的 calcTotalPages），不由后端单独传输。
 */
export interface PageResult<T> {
  /** 当前页记录列表 */
  records: T[]
  /** 页码，从 1 开始 */
  pageNum: number
  /** 每页记录数 */
  pageSize: number
  /** 符合查询条件的记录总数 */
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
  /** 模块版本，语义化版本 x.y.z，与模块 package.json 的 version 保持一致 */
  version: string
  /**
   * 依赖的其他模块：模块名 -> 版本范围。
   * 版本范围仅支持 `^` / `~` / 精确版本 / `*`（内核内置轻量匹配，不引入完整 semver）。
   * 注册时校验依赖存在性与版本，并按依赖拓扑排序注册。
   */
  deps?: Record<string, string>
  /** 默认是否停用；清单描述（ModuleDescriptor.disabled）可覆盖。停用的模块不注册、不参与聚合 */
  disabled?: boolean
  /** 静态菜单申报的权限码清单；动态菜单与用户权限由宿主 Provider 管理 */
  permissions?: string[]
  /** 可选静态菜单；真实业务模块可只提供 routes，由宿主 MenuProvider 提供动态菜单 */
  menus?: ModuleMenuItem[]
  /** 模块路由表；静态菜单的叶子 path 应有对应路由 */
  routes: ModuleRoute[]
}

/**
 * 模块清单描述：可 JSON 序列化的纯数据，与模块实现（manifest 内的组件等代码）分离。
 * 前期来自构建期确定的本地静态配置，后期来自 SaaS 平台配置接口，内核不关心来源。
 */
export interface ModuleDescriptor {
  /** 模块名，与 manifest.name 一一对应 */
  id: string
  /** 期望版本；缺省跟随实现版本。与 manifest.version 不一致时注册报错（防止配置与产物不符） */
  version?: string
  /** 启停开关，覆盖 manifest.disabled；缺省表示不覆盖 */
  disabled?: boolean
  /** 注册顺序，小的在前，缺省按 50 处理；依赖拓扑优先级高于 order */
  order?: number
  /** 远程 UMD 产物地址（后期 HttpLoader 使用），静态模式留空 */
  entry?: string
  /** 远程产物 SRI 完整性校验值（如 sha384-...，后期远程加载使用） */
  integrity?: string
  /** UMD 产物挂载的全局变量名（如 DemoModule），远程加载时读取 */
  global?: string
}

/** 清单描述 + 模块实现：loader 的输出，内核 Registry 的统一输入 */
export interface LoadedModule {
  descriptor: ModuleDescriptor
  manifest: AdminModuleManifest
}

/**
 * 清单加载器抽象：基座只依赖该接口，不关心清单来自构建期还是平台接口。
 * - StaticLoader（core 提供 createStaticModuleLoader）：本地静态 import 的实现 + 静态 json 配置；
 * - HttpLoader（后期）：平台配置接口 + 远程 UMD 加载，启用前静态模式不实现该分支。
 */
export interface ModuleLoader {
  load(): Promise<LoadedModule[]>
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

/** 全局右侧面板打开参数：内容由调用方以「组件 + props」传入，面板本身不持有业务数据 */
export interface PanelOpenOptions {
  /** 面板标题，缺省为「详情」 */
  title?: string
  /** 展开宽度（px），缺省沿用壳层持久化宽度 */
  width?: number
  /** 面板内容组件，由调用方模块提供 */
  component: Component
  /** 传给内容组件的 props */
  props?: Record<string, unknown>
  /** 路由变化时自动关闭，缺省 true；跨页面连续展示时可置 false */
  closeOnRouteChange?: boolean
  /** 打开时的初始收缩状态，缺省 false（展开） */
  collapsed?: boolean
}

/**
 * 壳层全局右侧面板控制器（可选注入契约，不属于内核 Provider 注册中心）。
 * 独立平台由 shell 通过 PANEL_CONTROLLER_KEY（@kacean/common）provide；
 * 无头宿主可自行提供同接口实现；模块 inject 结果可能为 undefined，须做本地降级。
 */
export interface PanelController {
  open(options: PanelOpenOptions): void
  close(): void
  toggleCollapsed(): void
  isVisible(): boolean
}

/** Provider 注册中心契约：按 kind 注册对应能力 */
export interface ProviderMap {
  auth: AuthProvider
  permission: PermissionProvider
  menu: MenuProvider
  layout: LayoutProvider
}

export type ProviderKind = keyof ProviderMap
