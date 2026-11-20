import type { PermissionProvider } from '@kacean/types'

/** 当前用户持有的权限码，'*' 表示全部权限；mock 数据，后续改由登录接口下发 */
const grantedPermissions = new Set(['*'])

/** mock PermissionProvider：按权限码集合判断，支持 '*' 通配 */
export function createMockPermissionProvider(): PermissionProvider {
  return {
    hasPermission: (permission) => grantedPermissions.has('*') || grantedPermissions.has(permission)
  }
}
