import { createHttpClientFactory, type HttpAuthProvider } from '@kacean/common'
import { httpConfig } from '../config'

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
 * shell 统一配置的 HttpClient 工厂：鉴权、全局地址与公共请求能力在此收敛。
 * 模块部署覆盖由 @kacean/module 合并，随后复用本工厂的全局地址回退。
 */
export const httpClientFactory = createHttpClientFactory({
  auth: createEmptyHttpAuthProvider(),
  origin: httpConfig.origin,
  basePath: httpConfig.basePath,
  timeout: httpConfig.timeout
})
