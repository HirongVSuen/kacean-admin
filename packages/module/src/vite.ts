import { existsSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

export const MODULE_REGISTRY_VIRTUAL_ID = 'virtual:kacean-module-registry'
export const MODULE_SELF_ID = '@kacean/module/self'
const RESOLVED_MODULE_REGISTRY_VIRTUAL_ID = '\0kacean-module-registry'
const RESOLVED_MODULE_SELF_PREFIX = '\0kacean-module-self:'

const MODULE_MODES = ['development', 'production', 'demo'] as const

export interface ModuleRegistryOptions {
  mode: string
  developmentModule?: string
}

interface RegisteredModule {
  id: string
  version: string
  modes: string[]
  root: string
  packageJsonUrl: URL
  packageInfo: {
    name: string
    version: string
    kacean: unknown
  }
}

function readJson(url: URL): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(url, 'utf8')) as Record<string, unknown>
  } catch (error) {
    throw new Error(`[kacean-module-registry] 无法读取 ${url.pathname}：${(error as Error).message}`)
  }
}

/** 以 shell 的 workspace 依赖作为唯一模块登记点，不扫描模块目录。 */
function collectRegisteredModules(): RegisteredModule[] {
  const workspaceRoot = new URL('../../../', import.meta.url)
  const shellManifest = readJson(new URL('packages/shell/package.json', workspaceRoot))
  const dependencies = (shellManifest.dependencies ?? {}) as Record<string, unknown>
  const modules: RegisteredModule[] = []

  for (const [name, range] of Object.entries(dependencies)) {
    if (range !== 'workspace:*') continue
    const packageJsonUrl = new URL(`packages/modules/${name}/package.json`, workspaceRoot)
    if (!existsSync(packageJsonUrl)) continue

    const manifest = readJson(packageJsonUrl)
    if (manifest.name !== name) {
      throw new Error(`[kacean-module-registry] 模块 ${name} 的 package.json name 与依赖名不一致`)
    }
    const version = manifest.version
    if (typeof version !== 'string' || !version) {
      throw new Error(`[kacean-module-registry] 模块 ${name} 缺少 version`)
    }
    const kacean = (manifest.kacean ?? {}) as Record<string, unknown>
    const modes = kacean.modes
    if (!Array.isArray(modes) || modes.length === 0 || modes.some((mode) => !MODULE_MODES.includes(mode))) {
      throw new Error(
        `[kacean-module-registry] 模块 ${name} 必须在 package.json 声明 kacean.modes（非空数组，可选 ${MODULE_MODES.join('/')}）`
      )
    }
    modules.push({
      id: name,
      version,
      modes: modes as string[],
      root: dirname(fileURLToPath(packageJsonUrl)),
      packageJsonUrl,
      packageInfo: { name, version, kacean }
    })
  }

  return modules.sort((a, b) => a.id.localeCompare(b.id))
}

function selectActiveModules(
  registeredModules: RegisteredModule[],
  { mode, developmentModule }: ModuleRegistryOptions
): RegisteredModule[] {
  if (mode === 'module-dev') {
    const name = developmentModule?.trim()
    const target = registeredModules.find((item) => item.id === name)
    if (!name || !target) {
      throw new Error(
        `[kacean-module-registry] module-dev 需要有效的 VITE_DEV_MODULE，可选：${registeredModules.map((item) => item.id).join(', ')}`
      )
    }
    return [target]
  }

  const activeModules = registeredModules.filter((item) => item.modes.includes(mode))
  if (activeModules.length === 0) {
    throw new Error(`[kacean-module-registry] mode=${mode} 没有任何模块在 package.json 的 kacean.modes 中声明归属`)
  }
  return activeModules
}

function generateModuleRegistry(registeredModuleNames: string[], activeModules: RegisteredModule[]): string {
  const importers = activeModules.map(({ id }) => `  ${JSON.stringify(id)}: () => import(${JSON.stringify(id)})`)
  const descriptors = activeModules.map(({ id, version }) => ({ id, version }))

  return [
    '// 由 Vite 构建期按 shell 依赖与各模块 package.json（kacean.modes）聚合生成。',
    `export const registeredModuleNames = ${JSON.stringify(registeredModuleNames)}`,
    `export const moduleDescriptors = ${JSON.stringify(descriptors)}`,
    'export const moduleImporters = {',
    importers.join(',\n'),
    '}'
  ].join('\n')
}

function findImporterModule(importer: string | undefined, modules: RegisteredModule[]): RegisteredModule | undefined {
  if (!importer) return undefined
  const importerPath = resolve(importer.split('?')[0])
  return modules.find(({ root }) => {
    const path = relative(root, importerPath)
    return path === '' || (!path.startsWith('..') && !isAbsolute(path))
  })
}

/**
 * 构建装配与 self 解析共用同一模块登记表：注册表负责模式裁剪，self 按 importer 内联包声明。
 * 不读取浏览器运行时配置；模块 package.json 变化后需重启开发服务器。
 */
export function moduleRegistry(options: ModuleRegistryOptions): Plugin {
  const registeredModules = collectRegisteredModules()
  const activeModules = selectActiveModules(registeredModules, options)

  return {
    name: 'kacean:module-registry',
    enforce: 'pre',
    buildStart() {
      for (const module of registeredModules) this.addWatchFile(fileURLToPath(module.packageJsonUrl))
      console.log(
        `[kacean-module-registry] mode=${options.mode} 挂载模块：${activeModules.map((item) => `${item.id}@${item.version}`).join(', ')}`
      )
    },
    resolveId(id, importer) {
      if (id === MODULE_REGISTRY_VIRTUAL_ID) return RESOLVED_MODULE_REGISTRY_VIRTUAL_ID
      if (id === MODULE_SELF_ID) {
        const module = findImporterModule(importer, registeredModules)
        if (!module) {
          throw new Error(`[kacean-module] @kacean/module/self 只能由已登记业务模块导入，引用方：${importer ?? '未知'}`)
        }
        return `${RESOLVED_MODULE_SELF_PREFIX}${module.id}`
      }
    },
    load(id) {
      if (id === RESOLVED_MODULE_REGISTRY_VIRTUAL_ID) {
        return generateModuleRegistry(
          registeredModules.map((item) => item.id),
          activeModules
        )
      }
      if (id.startsWith(RESOLVED_MODULE_SELF_PREFIX)) {
        const moduleId = id.slice(RESOLVED_MODULE_SELF_PREFIX.length)
        const module = registeredModules.find((item) => item.id === moduleId)
        if (!module) throw new Error(`[kacean-module] 未登记模块：${moduleId}`)
        return [
          `import { createModule, createModuleSelf } from '@kacean/module'`,
          `export const self = createModuleSelf(${JSON.stringify(module.packageInfo)})`,
          'export const defineModule = (definition) => createModule(self, definition)'
        ].join('\n')
      }
    }
  }
}
