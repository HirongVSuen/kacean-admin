import { kernel } from './kernel'

/**
 * 有 LayoutProvider：布局作为根路由组件，业务路由为其子路由；
 * 首页重定向与未匹配路径兜底取第一个可见菜单（/dashboard）。
 */
export default kernel.createRouter()
