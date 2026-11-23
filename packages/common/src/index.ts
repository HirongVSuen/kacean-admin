import type { InjectionKey } from 'vue'
import type { PanelController } from '@kacean/types'

export * from './response'
export * from './pagination'
export * from './http'

/**
 * 壳层全局右侧面板控制器的注入 key。
 * shell / 无头宿主可选 provide；模块以 inject(PANEL_CONTROLLER_KEY, undefined) 获取，
 * 未注入（模块独立开发、宿主未实现）时应使用本地 SidePanel 降级，不得假定一定存在。
 */
export const PANEL_CONTROLLER_KEY: InjectionKey<PanelController> = Symbol('kacean.panel-controller')
