import type { RouteRecordRaw, Router } from 'vue-router'
import type {
  AdminModuleManifest,
  AdminUser,
  AuthProvider,
  KernelContext,
  LayoutProvider,
  ModuleMenuItem,
  PermissionProvider,
  ProviderKind,
  ProviderMap
} from '@kacean/types'
import { createDefaultMenuProvider } from './menu'
import { createAdminRouter, resolveRoutes } from './router'
import type { CreateAdminRouterOptions } from './router'
import { validateManifest } from './validate'

export interface AdminKernel {
  /** 按 kind 注册能力 Provider，重复注册同 kind 覆盖；layout 不注册即为无头模式 */
  registerProvider<K extends ProviderKind>(kind: K, provider: ProviderMap[K]): void
  /** 注册业务模块，注册即做契约校验，校验失败抛错 */
  registerModule(manifest: AdminModuleManifest): void
  getManifests(): AdminModuleManifest[]
  /** 经 MenuProvider 编排过滤后的菜单树 */
  getMenus(): ModuleMenuItem[]
  /** 合并后的路由描述对象，不创建 router 实例 */
  getRoutes(): RouteRecordRaw[]
  getUser(): AdminUser | null | Promise<AdminUser | null>
  hasPermission(permission: string): boolean
  /** 有头形态便捷方法：创建 vue-router 实例，有 Layout 时自动包一层布局根路由 */
  createRouter(options?: CreateAdminRouterOptions): Router
}

/** 取菜单树中第一个叶子节点 path，作为缺省首页 */
function firstLeafPath(menus: ModuleMenuItem[]): string | undefined {
  for (const item of menus) {
    if (item.children?.length) {
      const child = firstLeafPath(item.children)
      if (child) return child
    } else {
      return item.path
    }
  }
  return undefined
}

/** 缺省 Provider：匿名身份、权限全部放行、默认菜单编排；layout 缺省 = 无头 */
const defaultAuth: AuthProvider = { getCurrentUser: () => null }
const defaultPermission: PermissionProvider = { hasPermission: () => true }

/**
 * 创建 admin 内核：模块加载、路由合并、契约校验、Provider 注册中心。
 * 两种运行形态：
 * - 注册 LayoutProvider：独立平台，由布局组件渲染骨架（kernel.createRouter() 自动挂载）
 * - 不注册 LayoutProvider：无头 SDK，宿主消费 getMenus()/getRoutes()/hasPermission() 自行渲染
 */
export function createAdminKernel(): AdminKernel {
  const manifests: AdminModuleManifest[] = []
  const providers: Partial<ProviderMap> = {}
  const defaultMenu = createDefaultMenuProvider()

  const getUser: AdminKernel['getUser'] = () => (providers.auth ?? defaultAuth).getCurrentUser()
  const hasPermission: AdminKernel['hasPermission'] = (permission) =>
    (providers.permission ?? defaultPermission).hasPermission(permission)
  const ctx: KernelContext = { hasPermission, getUser }

  return {
    registerProvider(kind, provider) {
      providers[kind] = provider
    },
    registerModule(manifest) {
      validateManifest(manifest, manifests)
      manifests.push(manifest)
    },
    getManifests: () => [...manifests],
    getMenus: () => (providers.menu ?? defaultMenu).resolve(manifests, ctx),
    getRoutes: () => resolveRoutes(manifests),
    getUser,
    hasPermission,
    createRouter(options = {}) {
      const homePath = options.homePath ?? firstLeafPath(this.getMenus())
      const layout: LayoutProvider | undefined = providers.layout
      return createAdminRouter(this.getRoutes(), layout, { ...options, homePath })
    }
  }
}
