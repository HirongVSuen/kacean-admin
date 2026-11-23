import type { InjectionKey } from 'vue'
import type { ApiResponse } from '@kacean/types'
import { isSuccessResponse } from './response'

/** 网络层错误码（fetch  reject 且非超时/取消） */
export const HTTP_NETWORK_ERROR_CODE = 'NETWORK_ERROR'
/** 请求超时错误码 */
export const HTTP_TIMEOUT_ERROR_CODE = 'TIMEOUT'
/** 请求被外部 signal 取消的错误码 */
export const HTTP_ABORTED_ERROR_CODE = 'ABORTED'
/** 响应不是合法 ApiResponse（非 JSON 或缺少 code）的错误码 */
export const HTTP_INVALID_RESPONSE_CODE = 'INVALID_RESPONSE'

/**
 * 统一鉴权抽象（先抽象，具体实现待确认）。
 * Bearer Token / Cookie / 签名等方式由 shell 或无头宿主实现后在工厂层统一注入，
 * 业务模块只依赖该接口，不关心鉴权细节；缺省不传即为匿名。
 * 注意与内核 AuthProvider（登录身份）区分：本接口只负责请求的鉴权头与失效回调。
 */
export interface HttpAuthProvider {
  /** 获取附加到请求头的鉴权字段；匿名/未登录返回 null。支持异步（如先刷新 token） */
  getAuthHeaders(): Record<string, string> | null | undefined | Promise<Record<string, string> | null | undefined>
  /** 收到 HTTP 401 时的回调（如跳转登录、清理会话），由实现方决定 */
  onUnauthorized?: () => void
}

/** 请求错误：业务失败与传输层失败统一抛出，通过 code 区分 */
export class HttpError<T = unknown> extends Error {
  /** 后端业务错误码（如 VALIDATION_ERROR），或 NETWORK_ERROR / TIMEOUT / ABORTED / INVALID_RESPONSE / HTTP_<status> */
  readonly code: string
  /** HTTP 状态码；网络层错误为 undefined */
  readonly status?: number
  /** 失败响应携带的 data（如 VALIDATION_ERROR 的字段错误详情），无则为 null */
  readonly data: T | null
  /** 原始错误（网络错误、JSON 解析错误等） */
  readonly cause?: unknown

  constructor(message: string, options: { code: string; status?: number; data?: T | null; cause?: unknown }) {
    super(message)
    this.name = 'HttpError'
    this.code = options.code
    this.status = options.status
    this.data = options.data ?? null
    this.cause = options.cause
  }
}

/** query 参数值：数组会序列化为重复 key；null / undefined 忽略 */
export type HttpQueryValue = string | number | boolean | null | undefined | Array<string | number | boolean>

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** 拼接在 URL 后的 query 参数 */
  params?: Record<string, HttpQueryValue>
  /** 请求体：普通对象按 JSON 发送；string / FormData / Blob / URLSearchParams / ArrayBuffer 原样发送 */
  body?: unknown
  /** 单次请求附加请求头，优先级高于 client 公共头与鉴权头 */
  headers?: Record<string, string>
  /** 外部取消信号 */
  signal?: AbortSignal
  /** 单次请求超时（毫秒），覆盖 client 配置；0 表示不超时 */
  timeout?: number
}

export interface HttpClientConfig {
  /**
   * 服务基础地址（如 '/api/user' 或 'https://example.com/api'），可为空字符串表示同源。
   * 一个 client 对应一个 baseURL；模块对接多个后端服务时创建多个实例。
   */
  baseURL: string
  /** 统一鉴权提供者，缺省匿名 */
  auth?: HttpAuthProvider
  /** 公共请求头 */
  headers?: Record<string, string>
  /** 默认超时毫秒，缺省 30000；0 表示不超时 */
  timeout?: number
  /** 自定义 fetch 实现（测试或宿主环境），缺省全局 fetch */
  fetcher?: typeof fetch
}

/** 可覆盖的 client 配置（baseURL 由工厂 create 时单独传入） */
export type HttpClientOverrides = Partial<Omit<HttpClientConfig, 'baseURL'>>

export interface HttpClient {
  /**
   * 返回完整 ApiResponse：不拆包、不抛业务错误（HTTP/网络层错误仍抛 HttpError）。
   * 适用于需要读取完整响应的场景，如 VALIDATION_ERROR 的错误详情。
   */
  requestResult<T>(path: string, options?: HttpRequestOptions): Promise<ApiResponse<T>>
  /** 业务成功返回 data（后端无数据时为 null）；业务失败抛 HttpError（code 为后端业务错误码） */
  request<T>(path: string, options?: HttpRequestOptions): Promise<T | null>
  get<T>(path: string, options?: HttpRequestOptions): Promise<T | null>
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T | null>
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T | null>
  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T | null>
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T | null>
}

/** 工厂配置：client 公共配置 + 逻辑服务目录 */
export interface HttpClientFactoryOptions extends HttpClientOverrides {
  /**
   * 逻辑服务目录：service key -> baseURL，由 shell / 宿主按部署环境统一配置。
   * 模块只声明服务 key，不硬编码 baseURL；同一 key 可跨模块共享（复用同一份地址配置）。
   */
  services?: Record<string, string>
}

/**
 * HttpClient 工厂：鉴权等公共配置由工厂统一注入。
 * - createForService(service)：按逻辑服务 key 创建 client，baseURL 来自服务目录（模块的首选方式）；
 * - create(baseURL)：按地址字面量创建，仅用于临时完整地址等场景。
 * shell 通过 HTTP_CLIENT_FACTORY_KEY provide 统一配置的工厂，
 * 模块以 inject(HTTP_CLIENT_FACTORY_KEY, undefined) 获取，未注入时按模块内开发默认目录降级。
 */
export interface HttpClientFactory {
  create(baseURL: string, overrides?: HttpClientOverrides): HttpClient
  /** 服务 key 未在服务目录中配置时抛错，并列出已配置的服务 key */
  createForService(service: string, overrides?: HttpClientOverrides): HttpClient
}

/** HttpClient 工厂注入 key（可选注入契约，与 PANEL_CONTROLLER_KEY 同模式，不属于内核 Provider） */
export const HTTP_CLIENT_FACTORY_KEY: InjectionKey<HttpClientFactory> = Symbol('kacean.http-client-factory')

const DEFAULT_TIMEOUT = 30_000

function buildQuery(params?: Record<string, HttpQueryValue>): string {
  if (!params) return ''
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item))
    } else {
      search.append(key, String(value))
    }
  }
  return search.toString()
}

function resolveUrl(baseURL: string, path: string, params?: Record<string, HttpQueryValue>): string {
  // 绝对地址不拼接 baseURL，便于对接独立服务或临时完整链接
  let url = /^https?:\/\//i.test(path)
    ? path
    : `${baseURL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const query = buildQuery(params)
  if (query) url += `${url.includes('?') ? '&' : '?'}${query}`
  return url
}

/** 原生 body 类型原样透传，其余按 JSON 序列化 */
function isRawBody(body: unknown): body is BodyInit {
  return (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  )
}

/** 创建 HTTP client（零依赖 fetch 封装）；模块内通常按服务各建一个实例，统一从工厂获取 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  const fetcher = config.fetcher ?? globalThis.fetch.bind(globalThis)

  async function requestResult<T>(path: string, options: HttpRequestOptions = {}): Promise<ApiResponse<T>> {
    const method = options.method ?? 'GET'
    const url = resolveUrl(config.baseURL, path, options.params)

    const headers = new Headers(config.headers)
    const authHeaders = await config.auth?.getAuthHeaders()
    if (authHeaders) {
      for (const [key, value] of Object.entries(authHeaders)) headers.set(key, value)
    }
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) headers.set(key, value)
    }

    let body: BodyInit | undefined
    if (options.body !== undefined && options.body !== null) {
      if (isRawBody(options.body)) {
        body = options.body
      } else {
        body = JSON.stringify(options.body)
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
      }
    }

    // 超时与外部取消统一汇入同一个 AbortController
    const controller = new AbortController()
    const externalSignal = options.signal
    const onExternalAbort = () => controller.abort()
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort()
      else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
    }
    const timeout = options.timeout ?? config.timeout ?? DEFAULT_TIMEOUT
    let timedOut = false
    const timer =
      timeout > 0
        ? setTimeout(() => {
            timedOut = true
            controller.abort()
          }, timeout)
        : undefined

    try {
      const response = await fetcher(url, { method, headers, body, signal: controller.signal })
      if (response.status === 401) config.auth?.onUnauthorized?.()

      const text = await response.text()
      let payload: ApiResponse<T> | null = null
      if (text) {
        try {
          payload = JSON.parse(text) as ApiResponse<T>
        } catch (cause) {
          throw new HttpError<T>('响应不是合法 JSON', {
            code: HTTP_INVALID_RESPONSE_CODE,
            status: response.status,
            cause
          })
        }
      }
      if (!response.ok) {
        throw new HttpError<T>(payload?.message || `HTTP ${response.status}`, {
          code: `HTTP_${response.status}`,
          status: response.status,
          data: payload?.data ?? null
        })
      }
      if (!payload || typeof payload.code !== 'string') {
        throw new HttpError<T>('响应不符合 ApiResponse 契约（缺少 code）', {
          code: HTTP_INVALID_RESPONSE_CODE,
          status: response.status
        })
      }
      return payload
    } catch (error) {
      if (error instanceof HttpError) throw error
      if (timedOut) {
        throw new HttpError<T>(`请求超时（${timeout}ms）`, { code: HTTP_TIMEOUT_ERROR_CODE, cause: error })
      }
      if (controller.signal.aborted) {
        throw new HttpError<T>('请求已取消', { code: HTTP_ABORTED_ERROR_CODE, cause: error })
      }
      throw new HttpError<T>('网络请求失败', { code: HTTP_NETWORK_ERROR_CODE, cause: error })
    } finally {
      if (timer !== undefined) clearTimeout(timer)
      externalSignal?.removeEventListener('abort', onExternalAbort)
    }
  }

  async function request<T>(path: string, options?: HttpRequestOptions): Promise<T | null> {
    const result = await requestResult<T>(path, options)
    if (!isSuccessResponse(result)) {
      throw new HttpError<T>(result.message, { code: result.code, data: result.data })
    }
    return result.data
  }

  return {
    requestResult,
    request,
    get: <T>(path: string, options?: HttpRequestOptions) => request<T>(path, { ...options, method: 'GET' }),
    delete: <T>(path: string, options?: HttpRequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
    post: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: HttpRequestOptions) =>
      request<T>(path, { ...options, method: 'PATCH', body })
  }
}

/** 创建统一配置的工厂：shell/宿主在此注入鉴权与服务目录，模块只关心服务 key */
export function createHttpClientFactory(defaults: HttpClientFactoryOptions = {}): HttpClientFactory {
  const { services = {}, ...clientDefaults } = defaults
  return {
    create: (baseURL, overrides) => createHttpClient({ ...clientDefaults, ...overrides, baseURL }),
    createForService: (service, overrides) => {
      const baseURL = services[service]
      if (baseURL === undefined) {
        const available = Object.keys(services)
        throw new Error(
          `[http] 服务 "${service}" 未配置 baseURL，请在 shell 服务目录（src/services.config.ts）登记。` +
            (available.length > 0 ? `已配置服务：${available.join(', ')}` : '当前服务目录为空。')
        )
      }
      return createHttpClient({ ...clientDefaults, ...overrides, baseURL })
    }
  }
}

/**
 * 默认匿名工厂：服务目录为空，仅支持 create(baseURL) 字面量方式。
 * 模块独立开发需要 createForService 时，应自行创建带开发默认目录的工厂（见 kacean-module-http Skill）。
 */
export const defaultHttpClientFactory: HttpClientFactory = createHttpClientFactory()
