import { defaultHttpClientFactory, HTTP_CLIENT_FACTORY_KEY, type HttpAddress, type HttpClient } from '@kacean/common'
import type { AdminModuleManifest } from '@kacean/types'
import { inject } from 'vue'

export type ModuleMode = 'development' | 'production' | 'demo'
export type ModuleServicePaths = string | Record<string, string>

export interface ModulePackageMetadata {
  modes: ModuleMode[]
  /** 单服务使用字符串；多服务使用模块内唯一 key -> 默认后端路径。 */
  servicePath?: ModuleServicePaths
  /** 模块默认地址；部署配置仍可逐字段覆盖。 */
  http?: HttpAddress
}

export interface ModulePackageInfo {
  name: string
  version: string
  kacean: ModulePackageMetadata
}

export interface ModuleServiceRuntimeOverride {
  servicePath?: string
  http?: HttpAddress
}

export interface ModuleRuntimeOverride {
  disabled?: boolean
  order?: number
  http?: HttpAddress
  services?: Record<string, ModuleServiceRuntimeOverride>
}

/** 当前模块的静态身份与启动时部署覆盖；两部分均为只读。 */
export interface ModuleSelf {
  id: string
  version: string
  modes: readonly ModuleMode[]
  servicePath?: ModuleServicePaths
  http?: Readonly<HttpAddress>
  runtime: Readonly<ModuleRuntimeOverride>
}

export type ModuleDefinition = Omit<AdminModuleManifest, 'name' | 'version'>
export type ModuleClientResolver = () => HttpClient

/**
 * 模块 HTTP 入口：默认服务直接调用，命名服务通过 for(key) 获取 resolver。
 * resolver 必须在 setup 等组件上下文中执行，事件与异步回调复用已取得的 client。
 */
export interface ModuleHttp extends ModuleClientResolver {
  for(service: string): ModuleClientResolver
}

export interface ModuleDefinitionResult {
  manifest: AdminModuleManifest
  http: ModuleHttp
}

const MODULE_MODES: readonly ModuleMode[] = ['development', 'production', 'demo']
const DEFAULT_SERVICE = 'default'
const EMPTY_RUNTIME: Readonly<ModuleRuntimeOverride> = Object.freeze({})

let runtimeOverrides: Record<string, Readonly<ModuleRuntimeOverride>> = {}

function freezeAddress(address: HttpAddress | undefined): Readonly<HttpAddress> | undefined {
  return address ? Object.freeze({ ...address }) : undefined
}

function freezeRuntime(override: ModuleRuntimeOverride): Readonly<ModuleRuntimeOverride> {
  const services: Record<string, Readonly<ModuleServiceRuntimeOverride>> = {}
  for (const [key, service] of Object.entries(override.services ?? {})) {
    services[key] = Object.freeze({ ...service, http: freezeAddress(service.http) })
  }
  return Object.freeze({
    disabled: override.disabled,
    order: override.order,
    http: freezeAddress(override.http),
    ...(override.services ? { services: Object.freeze(services) } : {})
  })
}

/** 由 shell / 无头宿主在动态加载模块前注入；业务模块只能读取 self.runtime。 */
export function registerModuleRuntimeOverrides(overrides: Record<string, ModuleRuntimeOverride>): void {
  runtimeOverrides = Object.fromEntries(
    Object.entries(overrides).map(([id, override]) => [id, freezeRuntime(override)])
  )
}

function assertServicePath(path: unknown, module: string, key: string): asserts path is string {
  if (typeof path !== 'string' || !path.trim().startsWith('/') || path.includes('?') || path.includes('#')) {
    throw new Error(`[module] ${module} 的 servicePath.${key} 必须是非空、以 / 开头且不含 query/hash 的路径`)
  }
}

function readServicePaths(input: ModuleServicePaths | undefined, module: string): Readonly<Record<string, string>> {
  if (
    input !== undefined &&
    typeof input !== 'string' &&
    (typeof input !== 'object' || input === null || Array.isArray(input))
  ) {
    throw new Error(`[module] ${module} 的 kacean.servicePath 必须是路径字符串或 key-value 对象`)
  }
  const paths = typeof input === 'string' ? { [DEFAULT_SERVICE]: input } : { ...input }
  if (input !== undefined && typeof input !== 'string' && Object.keys(paths).length === 0) {
    throw new Error(`[module] ${module} 的 kacean.servicePath 对象至少声明一个服务`)
  }
  for (const [key, path] of Object.entries(paths)) {
    if (!key.trim()) throw new Error(`[module] ${module} 的服务 key 不能为空`)
    assertServicePath(path, module, key)
  }
  return Object.freeze(paths)
}

/** 创建模块静态身份，并绑定只读的启动时部署配置视图。 */
export function createModuleSelf(packageInfo: ModulePackageInfo): ModuleSelf {
  const { name, version, kacean } = packageInfo
  if (!name.trim() || !version.trim()) throw new Error('[module] 模块 name/version 不能为空')
  if (
    !Array.isArray(kacean.modes) ||
    kacean.modes.length === 0 ||
    kacean.modes.some((mode) => !MODULE_MODES.includes(mode))
  ) {
    throw new Error(`[module] ${name} 的 kacean.modes 必须是 development/production/demo 组成的非空数组`)
  }

  const services = readServicePaths(kacean.servicePath, name)
  const unknownServices = Object.keys(runtimeOverrides[name]?.services ?? {}).filter(
    (key) => !Object.prototype.hasOwnProperty.call(services, key)
  )
  if (unknownServices.length) {
    throw new Error(`[module] ${name} 的运行时配置包含未声明服务：${unknownServices.join('、')}`)
  }

  return Object.freeze({
    id: name,
    version,
    modes: Object.freeze([...kacean.modes]),
    ...(kacean.servicePath !== undefined
      ? {
          servicePath:
            typeof kacean.servicePath === 'string' ? kacean.servicePath : Object.freeze({ ...kacean.servicePath })
        }
      : {}),
    http: freezeAddress(kacean.http),
    get runtime() {
      return runtimeOverrides[name] ?? EMPTY_RUNTIME
    }
  })
}

function createModuleHttp(self: ModuleSelf): ModuleHttp {
  const defaults = readServicePaths(self.servicePath, self.id)

  function resolveClient(service: string): HttpClient {
    const runtime = self.runtime
    const serviceOverride = runtime.services?.[service]
    const defaultPath = Object.prototype.hasOwnProperty.call(defaults, service) ? defaults[service] : undefined
    const servicePath = serviceOverride?.servicePath ?? defaultPath
    if (servicePath === undefined) {
      throw new Error(
        `[module] 模块 ${self.id} 未声明服务 "${service}"，请在 package.json 的 kacean.servicePath 中声明`
      )
    }

    assertServicePath(servicePath, self.id, service)

    // 模块接入层统一合并部署覆盖，再交给工厂补齐全局地址、鉴权与公共请求能力。
    const factory = inject(HTTP_CLIENT_FACTORY_KEY, undefined) ?? defaultHttpClientFactory
    return factory.createForPath({
      servicePath,
      origin: serviceOverride?.http?.origin ?? runtime.http?.origin ?? self.http?.origin,
      basePath: serviceOverride?.http?.basePath ?? runtime.http?.basePath ?? self.http?.basePath
    })
  }

  const http = (() => resolveClient(DEFAULT_SERVICE)) as ModuleHttp
  http.for = (service) => () => resolveClient(service)
  return http
}

/** 将模块业务定义与自身身份组合成内核 manifest，并提供当前模块的 HTTP 入口。 */
export function createModule(self: ModuleSelf, definition: ModuleDefinition): ModuleDefinitionResult {
  return {
    manifest: { ...definition, name: self.id, version: self.version },
    http: createModuleHttp(self)
  }
}
