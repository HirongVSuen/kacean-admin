import type { AdminModuleManifest, KernelContext, MenuProvider, ModuleMenuItem } from '@kacean/types'

/** 同级菜单缺省排序值，小于系统设置（100）、大于常见业务模块（10+） */
const DEFAULT_ORDER = 50

/** 递归过滤权限并按 order 稳定排序 */
function normalizeMenus(menus: ModuleMenuItem[], ctx: KernelContext): ModuleMenuItem[] {
  return menus
    .filter((item) => !item.permission || ctx.hasPermission(item.permission))
    .map((item) => ({
      ...item,
      children: item.children ? normalizeMenus(item.children, ctx) : undefined
    }))
    .sort((a, b) => (a.order ?? DEFAULT_ORDER) - (b.order ?? DEFAULT_ORDER))
}

/** 默认 MenuProvider：聚合各模块菜单 → PermissionProvider 过滤 → order 稳定排序 */
export function createDefaultMenuProvider(): MenuProvider {
  return {
    resolve: (manifests: AdminModuleManifest[], ctx: KernelContext) =>
      normalizeMenus(
        manifests.flatMap((manifest) => manifest.menus),
        ctx
      )
  }
}
