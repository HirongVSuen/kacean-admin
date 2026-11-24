---
name: kacean-module-http
description: 在 kacean-admin 业务模块中接入后端 HTTP 接口时使用。覆盖 @kacean/module/self、package.json 默认服务、多服务 http.for(key)、运行时 servicePath/http 分层覆盖，以及 Result/PageQuery 契约。
---

# 模块 HTTP 接入

业务模块使用 `defineModule` 返回的 `http` 调用后端；底层是 `@kacean/common` 的 `HttpClient`。禁止在模块内直接使用 `fetch` / axios，禁止在视图或资源 api 中硬编码模块 ID、origin、basePath、servicePath。

## 接入边界

1. **模块默认元数据**：在模块 package.json 的 `kacean` 中声明 `modes`、可选 `servicePath` 和 `http`。模块名与版本直接使用 package.json 的 `name/version`。
2. **模块入口**：`src/index.ts` 从 `@kacean/module/self` 导入 `defineModule`，导出 `{ manifest, http }`；不再维护 `src/manifest.ts` 或 `src/api/http.ts`。
3. **部署覆盖**：shell `config.js` 的 `modules.<id>` 只覆盖已构建、已声明的模块和服务，不能新增模块或服务 key。
4. **鉴权只在 shell / 宿主**：token、刷新与 401 行为集中在 HTTP 工厂；模块不得自行处理鉴权头。
5. **组件与面板**：继续使用 Vue 组件和 `PANEL_CONTROLLER_KEY` 注入，不引入模块生命周期框架。

## 1. 声明 package.json 元数据

单服务模块：

```json
{
  "name": "account-management",
  "version": "0.0.0",
  "dependencies": {
    "@kacean/module": "workspace:*",
    "@kacean/common": "workspace:*",
    "@kacean/types": "workspace:*"
  },
  "kacean": {
    "modes": ["development", "production"],
    "servicePath": "/two-ticket",
    "http": { "origin": "", "basePath": "/api" }
  }
}
```

- `kacean.http` 可整体省略；`origin/basePath` 缺省时继承全局。
- 字符串 `servicePath` 对应内部服务 key `default`，业务直接使用 `http()`。
- 多服务使用对象，key 只需在当前模块内唯一：

```json
"kacean": {
  "modes": ["development", "production"],
  "servicePath": {
    "account": "/login-account",
    "dict": "/data-dict"
  }
}
```

多服务没有默认服务时直接 `http()` 会报错，必须使用 `http.for('account')` 等显式选择。模块确实没有 HTTP 请求时可不声明 `servicePath`，也不要导出或使用 `http`。

## 2. 在 `src/index.ts` 创建 manifest 与 HTTP

```ts
import './styles.css'
import { defineModule } from '@kacean/module/self'

export const { manifest, http } = defineModule({
  routes: [{ path: '/account-management', component: () => import('./views/AccountManagement') }]
})
```

`@kacean/module/vite` 按 importer 定位模块 package.json，生成当前模块专属的 `self` 和绑定后的 `defineModule`。`self` 静态包含 `name/version/modes/http/servicePath`；不要手写 name/version，也不要在业务源码导入 package.json。其他模块内文件可 `import { self } from '@kacean/module/self'` 读取静态信息和只读 `self.runtime`。

`/self` 只能由已登记业务模块导入；公共包、shell 或非登记代码使用会在构建时报错。模块 package.json 元数据变更后需重启 Vite 开发服务器。

## 3. 视图与资源 api

资源 api 只接收 `HttpClient`：

```ts
import type { HttpClient } from '@kacean/common'
import type { PageQuery, PageResult, Query } from '@kacean/types'
import type { LoginAccount, LoginAccountQuery } from './types'

export function createLoginAccountApi(client: HttpClient) {
  return {
    page: (query: Query<LoginAccountQuery>) => client.post<PageResult<LoginAccount>>('/login-account/page', query)
  }
}
```

在视图 `setup()` 中获取 client 并创建 api，保持 client 在 setup 时解析：

```ts
import { http } from '../index'
import { createLoginAccountApi } from '../api/loginAccount'

export default defineComponent({
  setup() {
    const api = createLoginAccountApi(http())
    // ...
  }
})
```

多服务示例：

```ts
const accountApi = createLoginAccountApi(http.for('account'))
const dictApi = createDataDictApi(http.for('dict'))
```

`http()` 本身是函数，不是 `HttpClient`；不要写 `http.post(...)`。可用 `http.for('default')` 显式取得默认服务 client。

## 4. 地址与部署覆盖

最终 URL：

```text
origin + basePath + effectiveServicePath + 接口 path
```

`servicePath`：

```text
modules.<id>.services.<key>.servicePath
  > package.json kacean.servicePath[key]
```

`origin/basePath` 逐字段解析：

```text
modules.<id>.services.<key>.http
  > modules.<id>.http
  > package.json kacean.http
  > 全局 http.origin/basePath
```

全局地址再按 `config.js` > `VITE_HTTP_ORIGIN` / `VITE_HTTP_BASE_PATH` > 默认同源与 `/api` 回退。`origin/basePath` 的显式空字符串有效；`servicePath` 必须是以 `/` 开头的非空路径，且不能包含 query/hash。未提供模块、服务或字段表示继承，不能用 truthiness / `||` 合并。

```js
window.__KACEAN_CONFIG__ = {
  http: { origin: '', basePath: '/api', timeout: 30000 },
  modules: {
    'account-management': {
      disabled: false,
      order: 30,
      http: { basePath: '/openapi' },
      services: {
        default: {
          servicePath: '/two-ticket',
          http: { origin: 'https://account.example.com' }
        }
      }
    },
    'example-multi-service': {
      services: {
        account: { servicePath: '/account-v2', http: { basePath: '/account-api' } },
        dict: { http: { basePath: '/dict-api' } }
      }
    }
  }
}
```

未知模块、未知服务 key、空路径或非法路径会显式报错。`http` 只接受 `{ origin?, basePath? }`，不接受完整 baseURL；`servicePath` 只能放在 `services.<key>` 下。顶层不设置共享逻辑 `services`。

shell 在动态 import 前调用 `registerModuleRuntimeOverrides`，随后 `defineModule` 创建 manifest/http。修改部署 `config.js` 刷新页面后生效；运行中直接修改 `window.__KACEAN_CONFIG__` 不会热重建模块、路由或菜单。运行时不能增加构建期未纳入的模块。

## 5. 响应、错误与取消

- `ApiResponse<T>` 对应 `Result<T>`，成功码 `'0'`；`PageQuery<Q>` / `PageResult<T>` 对应后端分页。
- `request<T>` 默认拆包返回 data，业务失败抛 `HttpError`；`requestResult<T>` 返回完整响应。
- 仅确认控制器直接返回未包装 JSON 时使用 `responseFormat: 'raw'`。
- 视图卸载或查询竞态使用 `AbortController`；`HTTP_ABORTED_ERROR_CODE` 的取消错误不按业务失败提示。
- 参数校验错误可用 `VALIDATION_ERROR_CODE` / `isValidationErrorResponse` 识别。
- 长整型 ID 需要时通过 `parseJson` 转为字符串，不要改变 Result 默认校验。

## 验证

```bash
pnpm check:workspace
pnpm --filter <模块名> typecheck
pnpm check
pnpm build:dev
pnpm dev:module <模块名>
```

修改 `@kacean/module`、common HTTP 或 shell 配置时执行 `pnpm verify`，并补跑 `pnpm build:demo` 与相关 mode 构建。构建成功不代表后端连通或浏览器交互已验证；无自动化测试时明确说明。

验证失败先自主定位修复并重跑；同一错误连续两次未解决时更换排查策略。接口连通性、鉴权与真实数据无法本地验证时，在收尾报告「限制」中明确标注，不以构建通过代替联调结论；报告格式遵循根 `AGENTS.md`「0. 执行策略」。
