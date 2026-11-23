import type { PermissionProvider } from '@kacean/types'

/**
 * 默认 PermissionProvider：全部放行，保证纯静态模式与当前 integration 降级可用。
 * 后续联调时在启动阶段获取并缓存用户权限码，再在这里按权限码判断。
 */
export function createDefaultPermissionProvider(): PermissionProvider {
  return {
    hasPermission: () => true
  }
}
