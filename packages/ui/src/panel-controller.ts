import type { InjectionKey } from 'vue'
import type { PanelController } from '@kacean/types'

/**
 * 壳层全局右侧面板控制器的注入 key（可选注入契约，不属于内核 Provider）。
 * 与面板实现 SidePanel 同包：契约类型 PanelController 在 @kacean/types（纯类型），
 * 运行时 key 只能放在非纯类型包，放这里可避免纯逻辑使用方被迫引入本包样式。
 * shell / 无头宿主可选 provide；模块以 inject(PANEL_CONTROLLER_KEY, undefined) 获取，
 * 未注入（如无头宿主未实现）时应使用本地 SidePanel 降级，不得假定一定存在。
 */
export const PANEL_CONTROLLER_KEY: InjectionKey<PanelController> = Symbol('kacean.panel-controller')
