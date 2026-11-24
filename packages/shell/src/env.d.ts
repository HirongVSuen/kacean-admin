/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BASE_PATH?: string
  readonly VITE_BUILD_OUT_DIR?: string
  readonly VITE_APP_TITLE?: string
  readonly VITE_HOME_PATH?: string
  readonly VITE_HTTP_TIMEOUT?: string
  readonly VITE_HTTP_ORIGIN?: string
  readonly VITE_HTTP_BASE_PATH?: string
  readonly VITE_DISABLED_MODULES?: string
  readonly VITE_MENU_SOURCE?: string
  readonly VITE_MENU_PATH?: string
  readonly VITE_TWO_TICKET_PROXY_TARGET?: string
  readonly VITE_DEV_MODULE?: string
}

declare module 'virtual:kacean-module-registry' {
  import type { AdminModuleManifest, ModuleDescriptor } from '@kacean/types'

  export type ModuleImporter = () => Promise<{ manifest: AdminModuleManifest }>
  export const registeredModuleNames: readonly string[]
  /** 当前模式候选集的 descriptor 快照（id/version），运行时覆盖校验与清单展示共用。 */
  export const moduleDescriptors: readonly ModuleDescriptor[]
  export const moduleImporters: Readonly<Record<string, ModuleImporter>>
}
