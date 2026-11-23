/**
 * 逻辑服务目录：service key -> baseURL，是全部业务模块服务地址的唯一配置来源。
 *
 * 约定：
 * - 模块只在自身 `src/api/` 声明依赖的服务 key，不硬编码 baseURL；
 * - 同一后端服务跨模块复用同一个 key（如 'user'），跨服务使用不同 key（如 'file'）；
 * - key 命名使用小写中划线（如 'user-center'），新增 key 必须在此登记，否则模块调用 createForService 会抛错；
 * - 地址按部署环境配置，可用 import.meta.env 覆盖；默认同源地址由开发服务器代理到本机服务。
 */
export const serviceBaseURLs: Record<string, string> = {
  'two-ticket': import.meta.env.VITE_TWO_TICKET_API_BASE_URL ?? '/api/two-ticket'
}
