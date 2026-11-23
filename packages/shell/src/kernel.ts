import { createAdminKernel } from '@kacean/core'
import { moduleLoader } from './modules'
import { createMockAuthProvider } from './providers/auth'
import { createShellMenuProvider } from './providers/menu'
import { createDefaultPermissionProvider } from './providers/permission'
import { createTDesignLayoutProvider } from './providers/TDesignLayout'

/**
 * shell 组装入口：创建内核并注册能力 Provider 与业务模块。
 * 注册 LayoutProvider = 独立平台形态；去掉 layout 注册即为无头 SDK，仅输出菜单、权限与业务组件。
 */
export const kernel = createAdminKernel()
const menuProvider = createShellMenuProvider()

kernel.registerProvider('auth', createMockAuthProvider())
kernel.registerProvider('permission', createDefaultPermissionProvider())
kernel.registerProvider('menu', menuProvider)
kernel.registerProvider('layout', createTDesignLayoutProvider(kernel))

/** 模块经清单加载器统一注册（disabled 过滤 + 依赖校验 + 拓扑排序）。 */
export const kernelReady = kernel.loadModules(moduleLoader)

/** 完整平台启动：先注册全部路由，再初始化菜单；当前权限 Provider 默认全部放行。 */
export const shellReady = (async () => {
  await kernelReady
  await menuProvider.initialize(kernel.getRoutes().map((route) => route.path))
})()
