/**
 * 本模块依赖的逻辑服务声明。
 * baseURL 的唯一集成配置来源是 shell 的 services.config.ts。
 */
export const MODULE_SERVICES = ['two-ticket'] as const
export type ModuleService = (typeof MODULE_SERVICES)[number]

/** 模块独立开发默认目录，仅在 shell 工厂未注入时使用。 */
export const DEV_SERVICE_BASE_URLS: Record<ModuleService, string> = {
  'two-ticket': '/api/two-ticket'
}
