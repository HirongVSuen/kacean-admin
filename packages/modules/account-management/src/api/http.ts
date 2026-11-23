import { inject } from 'vue'
import { HTTP_CLIENT_FACTORY_KEY, createHttpClientFactory } from '@kacean/common'
import type { HttpClient } from '@kacean/common'
import { DEV_SERVICE_BASE_URLS } from './services'
import type { ModuleService } from './services'

/** 独立开发或无头宿主未注入工厂时，使用模块开发默认目录。 */
const devFactory = createHttpClientFactory({ services: DEV_SERVICE_BASE_URLS })

/** 必须在 setup 等组件上下文中调用，事件与异步函数复用已获取的 client。 */
export function useServiceClient(service: ModuleService): HttpClient {
  const factory = inject(HTTP_CLIENT_FACTORY_KEY, undefined) ?? devFactory
  return factory.createForService(service)
}
