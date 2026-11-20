import type { AdminUser, AuthProvider } from '@kacean/types'

const mockUser: AdminUser = {
  id: '1',
  name: 'admin',
  permissions: ['*']
}

/** mock AuthProvider：固定返回 admin 用户，后续替换为真实登录接口实现 */
export function createMockAuthProvider(): AuthProvider {
  return {
    getCurrentUser: () => mockUser
  }
}
