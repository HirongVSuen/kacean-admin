import { createAdminKernel } from '@kacean/core'
import { shellManifest } from './manifest'
import { moduleManifests } from './modules'
import { createMockAuthProvider } from './providers/auth'
import { createMockPermissionProvider } from './providers/permission'
import { createTDesignLayoutProvider } from './providers/TDesignLayout'

/**
 * shell 组装入口：创建内核并注册能力 Provider 与业务模块。
 * 注册 LayoutProvider = 独立平台形态；去掉 layout 注册即为无头 SDK，仅输出菜单、权限与业务组件。
 */
export const kernel = createAdminKernel()

kernel.registerProvider('auth', createMockAuthProvider())
kernel.registerProvider('permission', createMockPermissionProvider())
kernel.registerProvider('layout', createTDesignLayoutProvider(kernel))
// MenuProvider 使用内核默认实现（权限过滤 + order 排序），需要自定义编排时在此注册

kernel.registerModule(shellManifest)
for (const manifest of moduleManifests) {
  kernel.registerModule(manifest)
}
