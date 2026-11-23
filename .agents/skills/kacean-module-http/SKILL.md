---
name: kacean-module-http
description: 在 kacean-admin 业务模块中接入后端 HTTP 接口时使用。覆盖逻辑服务 key 声明（单模块多 baseURL、跨模块共享服务、跨服务对接）、@kacean/common 的 HttpClient 用法、Result/PageQuery 契约、错误与取消处理、模块独立开发降级与 shell 服务目录配置。
---

# kacean-module-http

业务模块统一通过 `@kacean/common` 的 `HttpClient` 调后端，禁止在模块内直接 `fetch` / 引入 axios。

## 核心原则

1. **服务 key 与 baseURL 分离**：模块只声明依赖的「逻辑服务 key」（如 `template`、`file`），实际 baseURL 由 shell `packages/shell/src/services.config.ts` 按部署环境统一配置。模块代码（含视图）不得硬编码生产 baseURL。
2. **服务 key 是跨模块共享约定**：同一个后端服务，所有模块使用同一个 key，地址只在 shell 配一次；对接不同后端服务用不同 key。key 用小写中划线命名（如 `user-center`），新增 key 必须在 shell 服务目录登记，否则 `createForService` 抛错并列出已配置 key。
3. **鉴权只在 shell**：token 存取、刷新、401 行为集中在 `packages/shell/src/providers/http.ts`（当前为空实现），模块不得自行处理 token 或鉴权头。
4. **client 从工厂获取**：`inject(HTTP_CLIENT_FACTORY_KEY, undefined)`，未注入时用模块内开发默认目录降级；不得绕过工厂自行 `createHttpClient` 充当正式配置。

## 模块接入步骤

### 1. 声明本模块的服务（`src/api/services.ts`）

```ts
/**
 * 本模块依赖的逻辑服务声明。
 * 同一后端服务跨模块复用同一 key；baseURL 唯一配置来源是 shell 的 services.config.ts。
 */
export const MODULE_SERVICES = ['template', 'file'] as const
export type ModuleService = (typeof MODULE_SERVICES)[number]

/** 模块独立开发（dev:module）默认目录，仅用于 shell 工厂未注入的降级场景 */
export const DEV_SERVICE_BASE_URLS: Record<ModuleService, string> = {
  template: '/api/template',
  file: '/api/file'
}
```

- 单模块多 baseURL：声明多个 key，分别获取 client。
- 跨模块共享服务：复用已有 key，不在本模块另造同义 key。
- 跨服务新增：先在本文件声明，再请 shell 侧登记 `services.config.ts`。

### 2. 封装获取入口（`src/api/http.ts`）

```ts
import { inject } from 'vue'
import {
  HTTP_CLIENT_FACTORY_KEY,
  createHttpClientFactory,
  type HttpClient
} from '@kacean/common'
import { DEV_SERVICE_BASE_URLS, type ModuleService } from './services'

/** 降级工厂：模块独立开发 / 无头宿主未注入时使用开发默认目录 */
const devFactory = createHttpClientFactory({ services: DEV_SERVICE_BASE_URLS })

/**
 * 获取指定逻辑服务的 client。必须在 setup() 等组件上下文中调用（依赖 inject）；
 * 事件回调、异步函数中使用已获取的 client 闭包，不要在回调里再次 inject。
 */
export function useServiceClient(service: ModuleService): HttpClient {
  const factory = inject(HTTP_CLIENT_FACTORY_KEY, undefined) ?? devFactory
  return factory.createForService(service)
}
```

### 3. 定义接口层（`src/api/<资源>.ts`）

响应契约对齐后端：`ApiResponse<T>` 对应 `Result<T>`（成功码 `'0'`），分页对应 `PageQuery<Q>` / `PageResult<T>`，见 `@kacean/types`。

```ts
import type { HttpClient } from '@kacean/common'
import type { PageQuery, PageResult, Query } from '@kacean/types'

export interface TemplateItem {
  id: string
  name: string
}

/** 业务查询参数：继承 Query（keyword / sorts），扩展自己的过滤字段 */
export interface TemplateQuery extends Query {
  status?: string
}

export function createTemplateApi(client: HttpClient) {
  return {
    /** 分页查询：POST PageQuery，成功返回 PageResult（records / total） */
    page: (query: PageQuery<TemplateQuery>, signal?: AbortSignal) =>
      client.post<PageResult<TemplateItem>>('/page', query, { signal }),
    detail: (id: string) => client.get<TemplateItem>(`/${id}`),
    remove: (id: string) => client.delete<void>(`/${id}`)
  }
}

export type TemplateApi = ReturnType<typeof createTemplateApi>
```

### 4. 视图中使用

```ts
import { DEFAULT_PAGE_SIZE, HttpError, HTTP_ABORTED_ERROR_CODE, VALIDATION_ERROR_CODE } from '@kacean/common'

// setup() 内：
const api = createTemplateApi(useServiceClient('template'))

async function loadPage() {
  try {
    const result = await api.page({
      query: { keyword: '', sorts: [{ field: 'createdAt', direction: 'DESC' }] },
      pageNum: 1,
      pageSize: DEFAULT_PAGE_SIZE // 上限 MAX_PAGE_SIZE = 200
    })
    // request 拆包返回 data，后端无数据时为 null
    rows.value = result?.records ?? []
    total.value = result?.total ?? 0
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.code === HTTP_ABORTED_ERROR_CODE) return // 主动取消，不提示
      if (error.code === VALIDATION_ERROR_CODE) {
        // error.data 携带参数校验错误详情，按需映射到表单
      }
      // 其余 error.code：后端业务错误码，或 NETWORK_ERROR / TIMEOUT / INVALID_RESPONSE / HTTP_<status>
      // error.message 可直接用于消息提示
    }
    throw error
  }
}
```

- `request<T>` / `get/post/put/patch/delete<T>`：业务成功返回 `data`（可能为 `null`），业务失败抛 `HttpError`。
- `requestResult<T>`：需要完整 `ApiResponse` 时使用（如自行处理校验详情），不抛业务错误。
- 需要原始响应头、文件下载等超出 `Result` 契约的场景，先评估再扩展 common，不在模块内另起请求实现。
- 取消：视图卸载或重复查询时用 `AbortController`，`signal` 经 options 传入；超时默认 30s，可用 `timeout` 覆盖。

## shell 侧配置（新增服务 key 时）

1. 在 `packages/shell/src/services.config.ts` 登记：

   ```ts
   export const serviceBaseURLs: Record<string, string> = {
     template: import.meta.env.VITE_TEMPLATE_API_BASE_URL ?? '/api/template',
     file: import.meta.env.VITE_FILE_API_BASE_URL ?? '/api/file'
   }
   ```

2. 鉴权变更只改 `packages/shell/src/providers/http.ts`（`HttpAuthProvider`，当前空实现），工厂已在 `main.ts` 通过 `HTTP_CLIENT_FACTORY_KEY` provide，无需再动模块。

## 禁忌

- 不在模块视图 / api 层直接使用 `fetch`、axios 或手写 baseURL 常量（开发默认目录除外）。
- 不在模块内读取 / 刷新 token、处理 401 跳转。
- 模块之间不互相 import `api/`；共享后端服务通过同一服务 key 复用，共享类型下沉 `@kacean/types`。
- 不把 mock 数据描述为真实接口；接口未就绪时保留 mock 并在 api 层隔离，便于切换。

## 验证闭环

```bash
pnpm build:module <模块名>
pnpm --filter shell typecheck
pnpm lint
pnpm build:shell
```

- 修改 common 请求层或 shell 服务目录时，必须跑完整上述命令；新增 key 未登记导致的 `createForService` 抛错属于预期保护。
- 接口联通、鉴权、取消与分页边界需浏览器走查；未执行时明确说明「浏览器交互未验证」。
