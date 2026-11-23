/**
 * 本模块依赖的逻辑服务声明。
 * baseURL 的唯一集成配置来源是 shell 的 services.config.ts。
 *
 * data-dict / data-dict-value 与 login-account、ticket-type 同属一个后端服务，
 * 按「同一后端服务跨模块复用同一 key」约定复用 two-ticket，不另造同义 key。
 */
export const MODULE_SERVICES = ['two-ticket'] as const
export type ModuleService = (typeof MODULE_SERVICES)[number]

/** 模块独立开发默认目录，仅在 shell 工厂未注入时使用。 */
export const DEV_SERVICE_BASE_URLS: Record<ModuleService, string> = {
  'two-ticket': '/api/two-ticket'
}
