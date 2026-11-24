import { createDefaultMenuProvider } from '@kacean/core'
import type { MenuProvider, ModuleMenuItem } from '@kacean/types'
import { shallowRef } from 'vue'
import { menuConfig } from '../config'
import { isModuleDevelopmentMode, shouldLoadBusinessMenus } from '../runtime-mode'
import { httpClientFactory } from './http'

/**
 * 内置外部业务菜单：menus.source=local 时使用，也可作为远程接口未接入前的本地数据源。
 * 业务模块自身不维护真实业务菜单与权限。
 */
const defaultBusinessMenus: ModuleMenuItem[] = [
  {
    path: '/two-ticket',
    title: '两票管理',
    icon: 'layers',
    group: '操作空间',
    order: 10,
    permission: 'two-ticket-management:view',
    children: [
      {
        path: '/two-ticket-management',
        title: '两票列表',
        order: 10,
        permission: 'two-ticket-management:view'
      },
      {
        path: '/two-ticket-management/ticket-types',
        title: '两票类型管理',
        order: 20,
        permission: 'two-ticket-management:view'
      }
    ]
  },
  {
    path: '/account-management',
    title: '账号管理',
    icon: 'user',
    group: '系统管理',
    order: 10,
    permission: 'account-management:view'
  },
  {
    path: '/menu-management',
    title: '菜单管理',
    icon: 'list',
    group: '系统管理',
    order: 20,
    permission: 'menu-management:view'
  },
  {
    path: '/data-dict-management',
    title: '数据字典管理',
    icon: 'app',
    group: '系统管理',
    order: 30,
    permission: 'data-dict-management:view'
  }
]

/** 配置与接口数据均为运行时输入，在进入菜单编排前校验基本结构。 */
function assertMenuItems(items: unknown, location = 'menus'): asserts items is ModuleMenuItem[] {
  if (!Array.isArray(items)) throw new Error(`[shell] ${location} 必须是数组`)

  items.forEach((item, index) => {
    const current = `${location}[${index}]`
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new Error(`[shell] ${current} 必须是菜单对象`)
    }
    const menu = item as ModuleMenuItem
    if (typeof menu.path !== 'string' || !menu.path.startsWith('/')) {
      throw new Error(`[shell] ${current}.path 必须是以 / 开头的字符串`)
    }
    if (typeof menu.title !== 'string' || !menu.title.trim()) {
      throw new Error(`[shell] ${current}.title 必须是非空字符串`)
    }
    if (menu.order !== undefined && (typeof menu.order !== 'number' || !Number.isFinite(menu.order))) {
      throw new Error(`[shell] ${current}.order 必须是有限数字`)
    }
    for (const key of ['icon', 'permission', 'group'] as const) {
      if (menu[key] !== undefined && typeof menu[key] !== 'string') {
        throw new Error(`[shell] ${current}.${key} 必须是字符串`)
      }
    }
    if (menu.children !== undefined) assertMenuItems(menu.children, `${current}.children`)
  })
}

/** 菜单路径属于 shell 自身实现；menus.http 可覆盖 origin/basePath，不占用业务模块配置。 */
const MENU_SERVICE_PATH = '/menu'

async function loadBusinessMenus(): Promise<ModuleMenuItem[]> {
  if (menuConfig.source === 'config') return menuConfig.items ?? []
  if (menuConfig.source === 'remote') {
    const client = httpClientFactory.createForPath({ servicePath: MENU_SERVICE_PATH, ...menuConfig.http })
    return (await client.get<ModuleMenuItem[]>(menuConfig.path)) ?? []
  }
  return defaultBusinessMenus
}

/** 动态菜单不经过 manifest 注册校验：重复 path 直接失败，未注册路由过滤并告警。 */
function normalizeDynamicMenus(
  menus: ModuleMenuItem[],
  routePaths: string[],
  warnOnMissingRoute = true
): ModuleMenuItem[] {
  assertMenuItems(menus)
  const routes = new Set(routePaths)
  const menuPaths = new Set<string>()

  const visit = (items: ModuleMenuItem[]): ModuleMenuItem[] => {
    const result: ModuleMenuItem[] = []
    for (const item of items) {
      if (menuPaths.has(item.path)) {
        throw new Error(`[shell] 动态菜单 path 重复：${item.path}`)
      }
      menuPaths.add(item.path)

      if (item.children?.length) {
        const children = visit(item.children)
        if (children.length) result.push({ ...item, children })
      } else if (!routes.has(item.path)) {
        if (warnOnMissingRoute) {
          console.warn(`[shell] 动态菜单 ${item.path} 对应路由未注册或模块已停用，已过滤`)
        }
      } else {
        result.push(item)
      }
    }
    return result
  }

  return visit(menus)
}

export interface ShellMenuProvider extends MenuProvider {
  /** 在创建 Router 前加载并整理外部菜单，确保首页可以从可见菜单推导。 */
  initialize(routePaths: string[]): Promise<void>
}

/**
 * shell 菜单 Provider：合并模板静态菜单与外部业务菜单，再统一执行权限过滤和排序。
 * shallowRef 让后续刷新菜单缓存时，布局中的 computed 菜单可以自动更新。
 */
export function createShellMenuProvider(): ShellMenuProvider {
  const externalMenus = shallowRef<ModuleMenuItem[]>([])
  const defaultProvider = createDefaultMenuProvider(() => externalMenus.value)

  return {
    async initialize(routePaths) {
      if (!shouldLoadBusinessMenus) {
        externalMenus.value = []
        return
      }

      const menus = await loadBusinessMenus()
      // 单模块开发会故意过滤其他模块的菜单，无需为每个未加载路由重复告警。
      externalMenus.value = normalizeDynamicMenus(menus, routePaths, !isModuleDevelopmentMode)
    },
    resolve(manifests, ctx) {
      return defaultProvider.resolve(manifests, ctx)
    }
  }
}
