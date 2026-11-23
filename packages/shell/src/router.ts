import { kernel } from './kernel'

/**
 * 有 LayoutProvider：布局作为根路由组件，业务路由为其子路由；
 * 首页重定向与未匹配路径兜底取第一个可见菜单叶子（静态模式为 /dashboard）。
 * 须在 shellReady 之后调用（模块完成注册、菜单完成初始化）。
 */
export function createShellRouter() {
  return kernel.createRouter()
}
