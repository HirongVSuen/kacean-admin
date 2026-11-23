import type { RouteRecordRaw, Router } from 'vue-router'
import type {
  AdminModuleManifest,
  AdminUser,
  AuthProvider,
  KernelContext,
  LayoutProvider,
  LoadedModule,
  ModuleLoader,
  ModuleMenuItem,
  PermissionProvider,
  ProviderKind,
  ProviderMap
} from '@kacean/types'
import { createDefaultMenuProvider } from './menu'
import { createAdminRouter, resolveRoutes } from './router'
import type { CreateAdminRouterOptions } from './router'
import { satisfiesVersion } from './semver'
import { validateManifest } from './validate'

export interface AdminKernel {
  /** 按 kind 注册能力 Provider，重复注册同 kind 覆盖；layout 不注册即为无头模式 */
  registerProvider<K extends ProviderKind>(kind: K, provider: ProviderMap[K]): void
  /** 注册业务模块，注册即做契约校验（含依赖存在性与版本），校验失败抛错；disabled 模块跳过 */
  registerModule(manifest: AdminModuleManifest): void
  /**
   * 经清单加载器批量注册模块：清单描述与模块实现分离。
   * 统一执行 disabled 过滤、依赖与版本校验、依赖拓扑排序（平级按 descriptor.order），
   * 与 StaticLoader / 后期 HttpLoader 无关，两种模式共用同一套注册编排逻辑。
   */
  loadModules(loader: ModuleLoader): Promise<void>
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

/** 依赖校验：目标须已注册且版本满足范围（拓扑排序保证依赖先注册） */
function assertDepsSatisfied(manifest: AdminModuleManifest, registered: AdminModuleManifest[]): void {
  for (const [dep, range] of Object.entries(manifest.deps ?? {})) {
    if (dep === manifest.name) {
      throw new Error(`[kacean-core] 模块 ${manifest.name} 不能依赖自身`)
    }
    const target = registered.find((item) => item.name === dep)
    if (!target) {
      throw new Error(`[kacean-core] 模块 ${manifest.name} 依赖 ${dep}@${range}，但 ${dep} 未注册或已停用`)
    }
    if (!satisfiesVersion(target.version, range, `模块 ${manifest.name} 的依赖 ${dep}`)) {
      throw new Error(`[kacean-core] 模块 ${manifest.name} 依赖 ${dep}@${range}，实际版本 ${target.version} 不满足`)
    }
  }
}

/** 依赖拓扑排序（Kahn）：平级按 descriptor.order（缺省 50），依赖优先于 order */
function sortByDependencyTopology(items: LoadedModule[]): LoadedModule[] {
  const sorted = [...items].sort((a, b) => (a.descriptor.order ?? 50) - (b.descriptor.order ?? 50))
  const pending = new Map(sorted.map((item) => [item.manifest.name, item]))
  const result: LoadedModule[] = []
  while (pending.size) {
    let progressed = false
    for (const [name, item] of pending) {
      const blocked = Object.keys(item.manifest.deps ?? {}).some((dep) => pending.has(dep))
      if (blocked) continue
      result.push(item)
      pending.delete(name)
      progressed = true
    }
    if (!progressed) {
      throw new Error(`[kacean-core] 模块依赖存在循环：${[...pending.keys()].join('、')}`)
    }
  }
  return result
}

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

  const registerOne = (manifest: AdminModuleManifest): void => {
    if (manifest.disabled) return
    validateManifest(manifest, manifests)
    assertDepsSatisfied(manifest, manifests)
    manifests.push(manifest)
  }

  return {
    registerProvider(kind, provider) {
      providers[kind] = provider
    },
    registerModule: registerOne,
    async loadModules(loader) {
      const loaded = await loader.load()
      // 合成有效 manifest：清单描述覆盖启停；版本不一致说明配置与产物不符，直接失败
      const effective = loaded.map(({ descriptor, manifest }) => {
        if (descriptor.id !== manifest.name) {
          throw new Error(`[kacean-core] 清单 id ${descriptor.id} 与实现 manifest.name ${manifest.name} 不一致`)
        }
        if (descriptor.version && descriptor.version !== manifest.version) {
          throw new Error(
            `[kacean-core] 模块 ${manifest.name} 清单版本 ${descriptor.version} 与实现版本 ${manifest.version} 不一致`
          )
        }
        return { descriptor, manifest: { ...manifest, disabled: descriptor.disabled ?? manifest.disabled } }
      })
      const active = effective.filter((item) => !item.manifest.disabled)
      const names = new Set(manifests.map((item) => item.name))
      for (const { manifest } of active) {
        if (names.has(manifest.name)) {
          throw new Error(`[kacean-core] 模块名重复：${manifest.name}`)
        }
        names.add(manifest.name)
      }
      for (const item of sortByDependencyTopology(active)) {
        registerOne(item.manifest)
      }
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
