import { createStaticModuleLoader } from '@kacean/core'
import { registerModuleRuntimeOverrides } from '@kacean/module'
import type { AdminModuleManifest, ModuleDescriptor, ModuleLoader } from '@kacean/types'
import { moduleDescriptors, moduleImporters, registeredModuleNames } from 'virtual:kacean-module-registry'
import { moduleOverrides } from './config'

// 必须先于模块动态 import 注入，保证 defineModule 与后续组件读取到同一份部署配置。
registerModuleRuntimeOverrides(moduleOverrides)

const registeredModuleNameSet = new Set(registeredModuleNames)

const unknownOverrides = Object.keys(moduleOverrides).filter((id) => !registeredModuleNameSet.has(id))
if (unknownOverrides.length) {
  throw new Error(`[shell] 模块配置包含未登记模块：${unknownOverrides.join('、')}`)
}

/** 构建期 descriptor 提供 id/version 默认值，运行时配置与环境变量按字段覆盖 disabled/order。 */
const activeDescriptors: ModuleDescriptor[] = moduleDescriptors.map((descriptor) => {
  const override = moduleOverrides[descriptor.id]
  return {
    ...descriptor,
    ...(override?.disabled !== undefined ? { disabled: override.disabled } : {}),
    ...(override?.order !== undefined ? { order: override.order } : {})
  }
})

async function loadManifest(name: string): Promise<AdminModuleManifest> {
  const importer = moduleImporters[name]
  if (!importer) {
    throw new Error(
      `[shell] 当前模式未生成模块 ${name} 的 import，请检查模块 package.json 的 kacean.modes 与 Vite mode`
    )
  }
  return (await importer()).manifest
}

/**
 * demo 样例模式仅挂载模板模块；development / production 挂载全部真实业务模块；
 * module-dev 复用完整 shell，但只挂载 VITE_DEV_MODULE 指定的一个模块。
 * 后期 SaaS 模式仅需以 HttpLoader 替换本 loader，内核注册编排不变。
 */
export const moduleLoader: ModuleLoader = {
  async load() {
    // 候选集与 descriptor 由 Vite 构建期按 shell 依赖和 kacean.modes 聚合生成；
    // loader 只消费启停与顺序，HTTP 地址由 @kacean/module 在创建 client 时解析。
    const modules: AdminModuleManifest[] = await Promise.all(
      activeDescriptors.map((descriptor) => loadManifest(descriptor.id))
    )

    return createStaticModuleLoader({ modules, descriptors: activeDescriptors }).load()
  }
}
