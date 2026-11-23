import { kernel } from './kernel'

/**
 * 有 LayoutProvider：布局作为根路由组件，业务路由为其子路由；
 * 首页重定向与未匹配路径兜底取第一个可见菜单（/dashboard）。
 * 须在 kernelReady 之后调用（模块完成注册才能合并路由）。
 */
export function createShellRouter() {
  return kernel.createRouter()
}
