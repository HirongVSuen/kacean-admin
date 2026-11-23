import { createStaticModuleLoader } from '@kacean/core'
import type { AdminModuleManifest, ModuleLoader } from '@kacean/types'
import descriptors from './modules.config.json'

const shouldLoadTemplateModule = import.meta.env.MODE !== 'integration'
const activeDescriptors = descriptors.filter((descriptor) =>
  shouldLoadTemplateModule ? descriptor.id === 'template-module' : descriptor.id !== 'template-module'
)

/**
 * 业务模块注册表（方案 B：模块自描述 + shell 显式注册）。
 * 默认 / static 仅挂载模板模块；integration 仅挂载真实业务模块。
 * 后续新增真实业务模块时，在 integration 分支显式登记并补充清单描述。
 * 后期 SaaS 模式仅需以 HttpLoader 替换本 loader，内核注册编排不变。
 */
export const moduleLoader: ModuleLoader = {
  async load() {
    let modules: AdminModuleManifest[]

    if (shouldLoadTemplateModule) {
      modules = [(await import('template-module')).manifest]
    } else {
      const [accountManagement, dataDictManagement, menuManagement, twoTicketManagement] = await Promise.all([
        import('account-management'),
        import('data-dict-management'),
        import('menu-management'),
        import('two-ticket-management')
      ])
      modules = [
        accountManagement.manifest,
        dataDictManagement.manifest,
        menuManagement.manifest,
        twoTicketManagement.manifest
      ]
    }

    return createStaticModuleLoader({ modules, descriptors: activeDescriptors }).load()
  }
}
