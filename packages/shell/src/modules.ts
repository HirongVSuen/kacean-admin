import { createStaticModuleLoader } from '@kacean/core'
import { manifest as templateModule } from 'template-module'
import { shellManifest } from './manifest'
import descriptors from './modules.config.json'

/**
 * 业务模块注册表（方案 B：模块自描述 + shell 显式注册）。
 * 前期按需模式：模块实现构建期显式 import（按需打包、tree-shake），
 * 清单配置 modules.config.json 决定启停与注册顺序，version 缺省跟随实现版本。
 * 后期 SaaS 模式仅需以 HttpLoader 替换本 loader，内核注册编排不变。
 */
export const moduleLoader = createStaticModuleLoader({
  modules: [shellManifest, templateModule],
  descriptors
})
