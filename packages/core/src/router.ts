import { createRouter as createVueRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouteRecordSingleView, Router, RouterHistory } from 'vue-router'
import type { AdminModuleManifest, LayoutProvider } from '@kacean/types'

/** 聚合各模块 manifest 的路由表（仅路由描述对象，不创建 router 实例，无头宿主可自行合并） */
export function resolveRoutes(manifests: AdminModuleManifest[]): RouteRecordRaw[] {
  return manifests.flatMap((manifest) =>
    manifest.routes.map((route) => ({
      path: route.path,
      // ModuleRouteComponent 兼容 vue-router 的 component（含动态 import 返回的模块对象）
      component: route.component as RouteRecordSingleView['component']
    }))
  )
}

export interface CreateAdminRouterOptions {
  /** 路由 history，缺省 createWebHistory() */
  history?: RouterHistory
  /** 首页路径：配置后生成 '/' 重定向与未匹配路径兜底；缺省取第一个可见菜单叶子 */
  homePath?: string
}

/**
 * 创建 vue-router 实例（有头形态的便捷方法，无头宿主一般自行创建并合并 getRoutes()）。
 * 有 LayoutProvider 时布局作为根路由组件，业务路由合并为其子路由，由布局内的 <RouterView /> 渲染。
 */
export function createAdminRouter(
  routes: RouteRecordRaw[],
  layout: LayoutProvider | undefined,
  options: CreateAdminRouterOptions = {}
): Router {
  const history = options.history ?? createWebHistory()
  const { homePath } = options

  if (layout) {
    const children: RouteRecordRaw[] = [...routes]
    if (homePath) {
      children.unshift({ path: '', redirect: homePath })
      children.push({ path: '/:pathMatch(.*)*', redirect: homePath })
    }
    return createVueRouter({
      history,
      routes: [{ path: '/', component: layout.component as RouteRecordSingleView['component'], children }]
    })
  }

  const rootRoutes: RouteRecordRaw[] = [...routes]
  if (homePath) {
    rootRoutes.push({ path: '/', redirect: homePath })
    rootRoutes.push({ path: '/:pathMatch(.*)*', redirect: homePath })
  }
  return createVueRouter({ history, routes: rootRoutes })
}
