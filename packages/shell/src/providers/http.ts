import { createHttpClientFactory, type HttpAuthProvider } from '@kacean/common'
import { serviceBaseURLs } from '../services.config'

/**
 * 统一鉴权空实现：token 存取、刷新与 401 行为待确认后补充。
 * 当前不附加任何鉴权头（匿名请求），仅保留统一的接入位置，
 * 业务模块通过 HTTP_CLIENT_FACTORY_KEY 拿到的工厂已绑定该实例，后续只需改这里。
 */
export function createEmptyHttpAuthProvider(): HttpAuthProvider {
  return {
    getAuthHeaders() {
      // TODO: 鉴权方式确认后在此读取 token 并返回鉴权头（如 { Authorization: `Bearer ${token}` }）
      return null
    },
    onUnauthorized() {
      // TODO: 鉴权方式确认后在此处理 401（如清理会话、刷新 token、跳转登录）
    }
  }
}

/**
 * shell 统一配置的 HttpClient 工厂：鉴权与服务目录在此收敛。
 * 模块通过 createForService(service) 按逻辑服务 key 创建 client，baseURL 来自 services.config.ts。
 */
export const httpClientFactory = createHttpClientFactory({
  auth: createEmptyHttpAuthProvider(),
  services: serviceBaseURLs
})
