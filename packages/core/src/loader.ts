import type { AdminModuleManifest, LoadedModule, ModuleDescriptor, ModuleLoader } from '@kacean/types'

export interface StaticModuleLoaderOptions {
  /** 构建期静态引入的模块实现（显式 import，按需打包、天然 tree-shake） */
  modules: AdminModuleManifest[]
  /**
   * 静态清单配置（通常来自本地 json）：决定启停、注册顺序，预留 entry/integrity 等远程元数据。
   * 缺省时从 modules 派生（全部启用、按声明顺序注册）。
   * 显式提供时，已静态引入但未登记的模块会报错，防止漏配静默丢失。
   */
  descriptors?: ModuleDescriptor[]
}

/**
 * StaticLoader：前期按需模式的清单加载器。
 * 清单来源是构建期确定的本地配置；后期 SaaS 模式以 HttpLoader 替换本 loader，
 * 内核 loadModules 的注册编排逻辑不变。
 */
export function createStaticModuleLoader(options: StaticModuleLoaderOptions): ModuleLoader {
  return {
    load(): Promise<LoadedModule[]> {
      const byName = new Map(options.modules.map((manifest) => [manifest.name, manifest]))
      const descriptors: ModuleDescriptor[] =
        options.descriptors ?? options.modules.map((manifest) => ({ id: manifest.name }))

      const configured = new Set<string>()
      const loaded = descriptors.map((descriptor) => {
        const manifest = byName.get(descriptor.id)
        if (!manifest) {
          throw new Error(`[kacean-core] 清单配置了模块 ${descriptor.id}，但未静态引入其实现（检查 shell 的模块登记）`)
        }
        if (configured.has(descriptor.id)) {
          throw new Error(`[kacean-core] 清单配置重复：${descriptor.id}`)
        }
        configured.add(descriptor.id)
        return { descriptor, manifest }
      })

      const missing = options.modules.filter((manifest) => !configured.has(manifest.name))
      if (options.descriptors && missing.length) {
        throw new Error(
          `[kacean-core] 模块 ${missing.map((item) => item.name).join('、')} 已静态引入但未在清单配置中登记`
        )
      }
      return Promise.resolve(loaded)
    }
  }
}
