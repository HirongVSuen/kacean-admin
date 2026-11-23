import { createDefaultMenuProvider } from '@kacean/core'
import type { MenuProvider, ModuleMenuItem } from '@kacean/types'
import { shallowRef } from 'vue'

const isIntegration = import.meta.env.MODE === 'integration'

/**
 * 默认外部业务菜单：仅作为 integration 的本地降级数据源，静态模式不加载业务菜单。
 * 后续联调在 initialize 中替换为接口获取，业务模块自身不维护菜单与权限。
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

/** 动态菜单不经过 manifest 注册校验：重复 path 直接失败，未注册路由过滤并告警。 */
function normalizeDynamicMenus(menus: ModuleMenuItem[], routePaths: string[]): ModuleMenuItem[] {
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
        console.warn(`[shell] 动态菜单 ${item.path} 对应路由未注册或模块已停用，已过滤`)
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
    initialize(routePaths) {
      // TODO：integration 接入时替换为远程菜单请求；权限码随菜单数据下发。
      externalMenus.value = isIntegration ? normalizeDynamicMenus(defaultBusinessMenus, routePaths) : []
      return Promise.resolve()
    },
    resolve(manifests, ctx) {
      return defaultProvider.resolve(manifests, ctx)
    }
  }
}
