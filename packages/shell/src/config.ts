import type { HttpAddress } from '@kacean/common'
import type { ModuleRuntimeOverride, ModuleServiceRuntimeOverride } from '@kacean/module'
import type { ModuleMenuItem } from '@kacean/types'

export type MenuSource = 'local' | 'config' | 'remote'

export type RuntimeModuleServiceOverride = ModuleServiceRuntimeOverride
export type RuntimeModuleOverride = ModuleRuntimeOverride

/** public/config.js 允许覆盖的运行时公开配置；所有字段均可选。 */
export interface ShellRuntimeConfig {
  app?: {
    title?: string
    homePath?: string
  }
  http?: {
    timeout?: number
    /** 全局协议 + 域名/IP + 端口；空字符串表示同源。 */
    origin?: string
    /** 全局 API 公共前缀；空字符串表示无前缀。 */
    basePath?: string
  }
  modules?: Record<string, RuntimeModuleOverride>
  menus?: {
    source?: MenuSource
    items?: ModuleMenuItem[]
    path?: string
    /** shell 远程菜单请求的地址覆盖，不属于任何业务模块。 */
    http?: HttpAddress
  }
}

declare global {
  interface Window {
    /** public/config.js 注入的运行时公开配置，不允许存放密钥。 */
    __KACEAN_CONFIG__?: ShellRuntimeConfig
  }
}

const runtime = window.__KACEAN_CONFIG__ ?? {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(runtimeValue: unknown, envValue: string | undefined, defaultValue: string, label: string): string {
  const value = runtimeValue ?? (envValue?.trim() || undefined) ?? defaultValue
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[shell] 配置 ${label} 必须是非空字符串`)
  }
  return value.trim()
}

function readOptionalPath(runtimeValue: unknown, envValue: string | undefined, label: string): string | undefined {
  const value = runtimeValue ?? (envValue?.trim() || undefined)
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.trim().startsWith('/')) {
    throw new Error(`[shell] 配置 ${label} 必须是以 / 开头的路由路径`)
  }
  return value.trim()
}

function readTimeout(runtimeValue: unknown, envValue: string | undefined): number {
  const value = runtimeValue ?? (envValue?.trim() || undefined) ?? 30_000
  const timeout = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
  if (!Number.isFinite(timeout) || timeout < 0) {
    throw new Error('[shell] 配置 http.timeout 必须是大于等于 0 的有限数字（0 表示不超时）')
  }
  return timeout
}

function readOptionalString(runtimeValue: unknown, envValue: string | undefined, label: string): string | undefined {
  const value = runtimeValue ?? envValue
  if (value === undefined) return undefined
  if (typeof value !== 'string') throw new Error(`[shell] 配置 ${label} 必须是字符串`)
  return value.trim()
}

function readOrigin(runtimeValue: unknown, envValue: string | undefined, label: string): string | undefined {
  const origin = readOptionalString(runtimeValue, envValue, label)
  if (origin === undefined || origin === '') return origin

  let url: URL
  try {
    url = new URL(origin)
  } catch {
    throw new Error(`[shell] 配置 ${label} 必须是 http(s) origin 或空字符串`)
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`[shell] 配置 ${label} 只能包含协议、域名/IP 与端口，不能包含路径、查询或哈希`)
  }
  return origin
}

function readBasePath(runtimeValue: unknown, envValue: string | undefined, label: string): string | undefined {
  const basePath = readOptionalString(runtimeValue, envValue, label)
  if (basePath !== undefined && basePath !== '' && !basePath.startsWith('/')) {
    throw new Error(`[shell] 配置 ${label} 必须是以 / 开头的路径或空字符串`)
  }
  return basePath
}

function readAddress(value: unknown, label: string): HttpAddress | undefined {
  if (value === undefined) return undefined
  if (!isRecord(value)) throw new Error(`[shell] 配置 ${label} 必须是仅含 origin/basePath 的对象`)

  const unsupported = Object.keys(value).filter((field) => field !== 'origin' && field !== 'basePath')
  if (unsupported.length > 0) {
    throw new Error(`[shell] 配置 ${label} 仅支持 origin/basePath，不支持：${unsupported.join(', ')}`)
  }
  return {
    origin: readOrigin(value.origin, undefined, `${label}.origin`),
    basePath: readBasePath(value.basePath, undefined, `${label}.basePath`)
  }
}

function readServicePath(value: unknown, label: string): string | undefined {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || !value.trim().startsWith('/') || value.includes('?') || value.includes('#')) {
    throw new Error(`[shell] 配置 ${label} 必须是非空、以 / 开头且不含 query/hash 的服务路径`)
  }
  return value.trim()
}

function readServices(value: unknown, label: string): Record<string, RuntimeModuleServiceOverride> | undefined {
  if (value === undefined) return undefined
  if (!isRecord(value)) throw new Error(`[shell] 配置 ${label} 必须是服务 key -> 覆盖配置对象`)

  const services: Record<string, RuntimeModuleServiceOverride> = {}
  for (const [key, item] of Object.entries(value)) {
    if (!key.trim()) throw new Error(`[shell] 配置 ${label} 包含空服务 key`)
    if (!isRecord(item)) throw new Error(`[shell] 配置 ${label}.${key} 必须是对象`)
    const unsupported = Object.keys(item).filter((field) => field !== 'servicePath' && field !== 'http')
    if (unsupported.length > 0) {
      throw new Error(`[shell] 配置 ${label}.${key} 仅支持 servicePath/http，不支持：${unsupported.join(', ')}`)
    }
    services[key] = {
      servicePath: readServicePath(item.servicePath, `${label}.${key}.servicePath`),
      http: readAddress(item.http, `${label}.${key}.http`)
    }
  }
  return services
}

function readModuleOverrides(value: unknown): Record<string, RuntimeModuleOverride> {
  if (value === undefined) return {}
  if (!isRecord(value)) throw new Error('[shell] 配置 modules 必须是模块 ID -> 覆盖配置对象')

  const modules: Record<string, RuntimeModuleOverride> = {}
  for (const [id, item] of Object.entries(value)) {
    if (!isRecord(item)) throw new Error(`[shell] 配置 modules.${id} 必须是对象`)
    const unsupported = Object.keys(item).filter((field) => !['disabled', 'order', 'http', 'services'].includes(field))
    if (unsupported.length > 0) {
      throw new Error(
        `[shell] 配置 modules.${id} 仅支持 disabled/order/http/services，不支持：${unsupported.join('、')}`
      )
    }
    if (item.disabled !== undefined && typeof item.disabled !== 'boolean') {
      throw new Error(`[shell] 配置 modules.${id}.disabled 必须是布尔值`)
    }
    if (item.order !== undefined && (typeof item.order !== 'number' || !Number.isFinite(item.order))) {
      throw new Error(`[shell] 配置 modules.${id}.order 必须是有限数字`)
    }
    modules[id] = {
      disabled: item.disabled as boolean | undefined,
      order: item.order as number | undefined,
      http: readAddress(item.http, `modules.${id}.http`),
      services: readServices(item.services, `modules.${id}.services`)
    }
  }
  return modules
}

function readMenuItems(value: unknown): ModuleMenuItem[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) throw new Error('[shell] 配置 menus.items 必须是菜单数组')
  return value as ModuleMenuItem[]
}

export const appConfig = {
  title: readString(runtime.app?.title, import.meta.env.VITE_APP_TITLE, 'kacean-admin', 'app.title'),
  homePath: readOptionalPath(runtime.app?.homePath, import.meta.env.VITE_HOME_PATH, 'app.homePath')
}

export const httpConfig = {
  timeout: readTimeout(runtime.http?.timeout, import.meta.env.VITE_HTTP_TIMEOUT),
  origin: readOrigin(runtime.http?.origin, import.meta.env.VITE_HTTP_ORIGIN, 'http.origin'),
  basePath: readBasePath(runtime.http?.basePath, import.meta.env.VITE_HTTP_BASE_PATH, 'http.basePath')
}

const configuredModules = readModuleOverrides(runtime.modules)

const disabledModules = new Set(
  (import.meta.env.VITE_DISABLED_MODULES ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
)

/** 环境变量只提供批量停用；运行时 modules.<id>.disabled 可逐项覆盖（包括重新启用）。 */
export const moduleOverrides: Record<string, RuntimeModuleOverride> = { ...configuredModules }
for (const id of disabledModules) {
  moduleOverrides[id] = {
    ...moduleOverrides[id],
    disabled: moduleOverrides[id]?.disabled ?? true
  }
}

const menuSource = readString(runtime.menus?.source, import.meta.env.VITE_MENU_SOURCE, 'local', 'menus.source')
if (menuSource !== 'local' && menuSource !== 'config' && menuSource !== 'remote') {
  throw new Error('[shell] 配置 menus.source 仅支持 local / config / remote')
}

const menuPath = readString(runtime.menus?.path, import.meta.env.VITE_MENU_PATH, '/current', 'menus.path')
if (!menuPath.startsWith('/')) throw new Error('[shell] 配置 menus.path 必须以 / 开头')

const menuItems = readMenuItems(runtime.menus?.items)
if (menuSource === 'config' && menuItems === undefined) {
  throw new Error('[shell] menus.source=config 时必须显式提供 menus.items（空数组表示无外部菜单）')
}

export const menuConfig = {
  source: menuSource,
  items: menuItems,
  path: menuPath,
  http: readAddress(runtime.menus?.http, 'menus.http')
}
