import { createWebHistory } from 'vue-router'
import { appConfig } from './config'
import { kernel } from './kernel'

/**
 * 有 LayoutProvider：布局作为根路由组件，业务路由为其子路由；
 * 首页重定向与未匹配路径兜底取第一个可见菜单叶子（静态模式为 /dashboard）。
 * 须在 shellReady 之后调用（模块完成注册、菜单完成初始化）。
 */
export function createShellRouter() {
  const homePath = appConfig.homePath
  if (homePath && !kernel.getRoutes().some((route) => route.path === homePath)) {
    throw new Error(`[shell] 配置的首页 ${homePath} 未注册或对应模块已停用`)
  }

  return kernel.createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    ...(homePath ? { homePath } : {})
  })
}
