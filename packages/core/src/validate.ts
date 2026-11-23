import type { AdminModuleManifest, ModuleMenuItem } from '@kacean/types'

/** 递归遍历菜单树 */
function walkMenus(menus: ModuleMenuItem[], visit: (item: ModuleMenuItem, isLeaf: boolean) => void) {
  for (const item of menus) {
    const isLeaf = !item.children?.length
    visit(item, isLeaf)
    if (item.children) walkMenus(item.children, visit)
  }
}

/**
 * 注册时契约校验：
 * - 模块名非空且全局唯一（报错）
 * - 路由 path 全局唯一（报错）
 * - 菜单 path 全局唯一（报错）
 * - 叶子菜单的 path 必须有对应路由（报错；含子菜单的父节点不强制）
 * - 菜单声明的 permission 应在模块 permissions 中申报（警告，不阻断）
 */
export function validateManifest(manifest: AdminModuleManifest, registered: AdminModuleManifest[]): void {
  if (!manifest.name) {
    throw new Error('[kacean-core] 模块缺少 name，无法注册')
  }
  if (!manifest.version) {
    throw new Error(`[kacean-core] 模块 ${manifest.name} 缺少 version，无法注册`)
  }
  if (registered.some((item) => item.name === manifest.name)) {
    throw new Error(`[kacean-core] 模块名重复：${manifest.name}`)
  }

  const registeredRoutePaths = new Set(registered.flatMap((item) => item.routes.map((route) => route.path)))
  const routePaths = new Set<string>()
  for (const route of manifest.routes) {
    if (routePaths.has(route.path) || registeredRoutePaths.has(route.path)) {
      throw new Error(`[kacean-core] 路由 path 重复：${route.path}（模块 ${manifest.name}）`)
    }
    routePaths.add(route.path)
  }

  const registeredMenuPaths = new Set<string>()
  for (const item of registered) {
    walkMenus(item.menus ?? [], (menu) => registeredMenuPaths.add(menu.path))
  }
  const menuPaths = new Set<string>()
  walkMenus(manifest.menus ?? [], (menu, isLeaf) => {
    if (menuPaths.has(menu.path) || registeredMenuPaths.has(menu.path)) {
      throw new Error(`[kacean-core] 菜单 path 重复：${menu.path}（模块 ${manifest.name}）`)
    }
    menuPaths.add(menu.path)
    if (isLeaf && !routePaths.has(menu.path)) {
      throw new Error(`[kacean-core] 菜单 ${menu.path} 缺少对应路由（模块 ${manifest.name}）`)
    }
    if (menu.permission && !manifest.permissions?.includes(menu.permission)) {
      console.warn(
        `[kacean-core] 菜单 ${menu.path} 的权限码 ${menu.permission} 未在模块 ${manifest.name} 的 permissions 中申报`
      )
    }
  })
}
