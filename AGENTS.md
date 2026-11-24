# kacean-admin — Agent 工作规范

本文件是本仓库对 AI coding agent 的**项目级约束**，优先级高于通用习惯。
开始任何任务前，先读本文件和涉及包的 `package.json`。

## 0. 执行策略（收敛与自主闭环）

### 收敛：控制范围与节奏

- 先界定完成标准再动手：明确要改的文件、要执行的验证命令与通过条件；需求存在多种理解时给出最可能方案与假设，涉及架构、数据或破坏性操作的分歧先提问，不自行扩题。
- 一次只做当前任务：不顺手重构、不「顺便」修改无关文件、不新增未要求的抽象、配置或依赖；发现的其他问题记入收尾报告，不现场扩大改动。
- 多文件 / 多包任务先列简要计划（步骤 + 验证方式），执行中逐项核对；范围变化先更新计划再继续。
- 每轮修改后自查 `git diff --stat`：出现预期外文件立即回退自己的多余改动；优先定向编辑，不重排、不格式化无关代码。

### 自主：自助取证与失败迭代

- 缺信息主动用工具获取（读源码、查命令输出、看 git 历史），不凭记忆猜 API，不等待用户投喂可自查的信息。
- 验证失败自主定位、修复、重跑，直至通过或确认为既有问题；同一错误连续两次未解决必须更换排查策略（缩小复现范围、读实现源码、查文档），不机械重复同一命令。
- 只有需要用户决策（需求分歧、凭证权限、不可逆操作）才中断提问；其余情况自主完成并如实汇报结果与限制。

### 提交纪律（仅在用户要求提交 / 推送时执行）

- 提交前复核 `git status --short` 与暂存区 `git diff --cached --stat`，只暂存本任务相关文件，禁止 `git add -A` / `git add .` 混入无关改动。
- 提交信息使用中文 Conventional Commits（如 `feat: ...`、`docs: ...`），准确概括本次改动；未通过验证的代码不得描述为已验证。
- 推送到当前分支已跟踪的上游；不擅自新建分支、强推或修改远程配置。

### 收尾报告（固定四段）

1. **变更**：文件清单与各自目的。
2. **验证**：实际执行的命令与结果，未执行的标注原因。
3. **限制**：浏览器走查、后端连通等未覆盖项。
4. **遗留**：既有失败、越界发现的问题与建议，不混入本次改动。

## 1. 项目定位

- pnpm monorepo（pnpm 10.34.9，见根 `package.json` 的 `packageManager`）。
- 技术栈：Vue 3 + TypeScript + Vite，shell 与业务模块统一。
- 架构：**shell 主应用 + 可按模块调试、可独立构建的业务模块（modules）+ 公共包**。
- 工作区声明见 `pnpm-workspace.yaml`：`packages/*`、`packages/modules/*`。

## 2. 目录约定

```
kacean-admin/
├─ .agents/skills/kacean-template-module/ # 模板页开发 Skill 与共享组件参考
├─ .agents/skills/kacean-module-http/     # 模块 HTTP 接入 Skill（默认服务、多服务与运行时地址覆盖）
├─ packages/
│  ├─ shell/              # 主壳应用与统一单模块开发宿主（注册 Provider + 业务模块）
│  ├─ core/               # 内核 @kacean/core：模块加载、契约校验、Provider 注册中心、路由/菜单合并
│  ├─ module/             # 接入层 @kacean/module：self、manifest/HTTP 工厂、运行时覆盖与 Vite 聚合
│  ├─ types/              # 共享 TypeScript 类型定义（纯类型，不含运行时代码）
│  ├─ common/             # 共享通用逻辑：工具函数、常量、HTTP 请求封装（fetch，多 baseURL + HttpAuthProvider 鉴权抽象）等（无 UI）
│  ├─ ui/                 # 共享 UI 组件
│  └─ modules/
│     ├─ account-management/    # 账号管理（登录账号查询、新增、编辑与删除，接入 login-account 接口）
│     ├─ data-dict-management/  # 数据字典管理（字典本地过滤分页，overlay 面板管理字典值，接入 data-dict / data-dict-value 接口）
│     ├─ menu-management/       # 菜单管理（静态菜单配置列表）
│     ├─ template-module/       # 静态工作台与模板展示（表格、分页、分步/分块表单与详情布局）
│     ├─ two-ticket-management/ # 两票管理（工作票与操作票静态列表）
│     └─ <模块名>/              # 独立业务插件模块，每一个文件夹就是一个模块
├─ scripts/               # 工程化脚本（模块命令转发、工作区约束检查）
├─ AGENTS.md              # 本文件
└─ pnpm-workspace.yaml
```

- `packages/` 下子包固定为 `shell`、`core`、`module`、`types`、`common`、`ui`，新增同级子包需先确认，并同步 `scripts/check-workspace.mjs` 的固定包清单。
- `packages/modules/` 下每一个文件夹都是**独立业务插件模块**：通过 `pnpm dev:module <模块名>` 在统一宿主中按模块调试；模块统一以 shell 为底座集成，不独立构建。
- 包名规则：公共包统一使用 `@kacean/*` scope——`@kacean/types`（目录 `types`）、`@kacean/core`、`@kacean/module`、`@kacean/common`、`@kacean/ui`（目录 `ui`）；`shell` 与业务模块的包名与目录名一致。
- `pnpm --filter` 使用完整包名，如 `pnpm --filter @kacean/common build`。
- 新增模块后，必须同步更新本文件与 `README.md` 的结构说明。
- 不擅自引入上述之外的顶层目录。

## 3. 命令契约（统一入口，不绕过）

| 操作                 | 命令                             |
| -------------------- | -------------------------------- |
| 安装依赖             | `pnpm install`（只在根目录执行） |
| 开发主壳（dev 联调） | `pnpm dev:shell`                 |
| 样例开发主壳（demo） | `pnpm dev:shell:demo`            |
| 联调环境构建         | `pnpm build:dev`                 |
| 生产环境构建         | `pnpm build:prod`                |
| 样例构建（demo）     | `pnpm build:demo`                |
| 开发某模块           | `pnpm dev:module <模块名>`       |
| 全仓构建             | `pnpm build`                     |
| 全仓类型检查         | `pnpm typecheck`                 |
| 工作区约束检查       | `pnpm check:workspace`           |
| 静态检查             | `pnpm check`                     |
| 完整本地验证         | `pnpm verify`                    |
| 全仓 lint            | `pnpm lint`                      |
| 格式只读检查         | `pnpm format:check`              |
| 全仓格式化           | `pnpm format`                    |

- 跨包操作一律用 `pnpm --filter <包名> <脚本>`，不 `cd` 进包内单独装依赖。
- `dev:module` 由根脚本启动 shell 的 `module-dev` 模式，通过 `VITE_DEV_MODULE` 只注册指定模块，复用真实布局、菜单、Provider 与 HTTP 配置；业务模块不再提供独立 Vite 应用、`src/dev/` 或 `index.html`。该模式只用于开发，不用于生产构建。
- 模式定位：dev（`development`）/ prod（`production`）是同一套真实业务模块的两种环境——dev 用于日常联调开发与联调环境包，prod 用于生产构建；`demo` 是独立样例模式，仅用于模板页参照、组件抽离与 AI 辅助开发。`build:dev` 只构建 shell，产物为 `packages/shell/dist/admin-dev`；`build:prod`（shell 包级 `build`，全仓 `build` 递归调用）产出 `packages/shell/dist/admin`；`build:demo` 只构建 shell，样例产物输出到 `packages/shell/dist/demo-admin`。各产物目录只由对应模式清理、互不覆盖。demo 仅在 shell 挂载纯静态 `template-module`；dev / prod 仅挂载 `account-management`、`data-dict-management`、`menu-management`、`two-ticket-management` 及后续登记的真实业务模块，不加载模板菜单、路由与模块实现。`template-module` 不判断环境模式、不提供联调脚本或接口分支。真实业务模块在 package.json 的 `kacean.servicePath` 声明默认服务路径，`@kacean/module` 负责部署覆盖与地址分层，禁止在模块视图与资源 api 文件中硬编码。
- shell 的环境默认值集中在 `packages/shell/.env.<mode>` 维护（`.env.development` / `.env.production` / `.env.demo` 分别是联调、生产、样例模式的环境配置文件）：production 使用 `VITE_BUILD_OUT_DIR=dist/admin`、`VITE_APP_BASE_PATH=/admin/`，development 使用 `VITE_BUILD_OUT_DIR=dist/admin-dev`（本地开发默认根路径，联调包需要二级路径时自行覆盖 `VITE_APP_BASE_PATH`），demo 使用 `VITE_BUILD_OUT_DIR=dist/demo-admin`、`VITE_APP_BASE_PATH=/demo-admin/`；环境或本地覆盖写入对应的 `.env.<mode>.local`，不直接修改共享默认值。各产物目录均为 `dist` 子目录，只由对应模式清理、互不影响。

## 4. 依赖规则（收敛重点）

- 包之间引用一律 `"workspace:*"`，禁止写死版本号、禁止相对路径跨包 import 源码。
- 公共包通过包名引入：`@kacean/types`、`@kacean/core`、`@kacean/module`、`@kacean/common`、`@kacean/ui`（根 `tsconfig.json` 已配置 paths 指向各包 `src`）。
- 依赖装到**实际使用它的包**：`pnpm --filter <包名> add <依赖>`。
- 根 `package.json` 只放工程化公共 devDependencies（lint、format 等），业务依赖禁止装根目录。
- 新增第三方依赖前先说明用途与体积影响，不擅自加装。
- 公共包（types / core / module / common / ui）以 TS/Vue **源码直接导出**（`exports` 指向 `src/index.ts`），由消费方的 Vite 统一编译，公共包自身不需要 `build`；`types` 为纯类型包。
- `ui` 收敛通用页面骨架、组合组件与轻量表单字段/弹框；`template-module` 的页面容器、卡片、表格、分页、树形展示（`AppTree`）、表单布局、详情布局、`Form*` 字段组件（含日期面板与 Calendar 日历板）和 `AppDialog` / `ConfirmDialog` / `AppDrawer` 优先使用 `@kacean/ui`。完整数据列表页使用 `DataTableTemplate`（统一页头、上方查询条件区、下方列表区域与底部分页，占满 main 可用高度且仅表格内容区滚动），表格与分页的轻量组合使用 `PaginatedTable`。`Button`、`Tag`、`Alert` 等未封装原子组件直接使用 TDesign。共享组件不包含模块名、示例字段、mock 数据或上传请求。

## 5. 验证闭环（自主能力基础）

- `shell` 必须提供 `dev`、`dev:module`、`build`、`typecheck`，业务模块必须提供 `typecheck`；模块开发统一走根 `dev:module`，模块自身不提供 `dev` / `build`，统一以 shell 为底座集成。公共包以源码直出，不强制提供 `dev` / `build`，其源码由消费方编译，已有 `typecheck` / `test` 必须执行。
- 工作区已有改动或任务可能影响核心、共享代码时，修改前先运行最小验证作为基线；修改后根据 diff 和报错位置区分本次引入与既有问题，不通过新增忽略规则、降低类型要求或删除测试掩盖失败。
- 统一入口：`pnpm check:workspace` 检查包名、内部依赖协议与方向、模块标准脚本和 shell 清单依赖；`pnpm typecheck` 执行所有已配置的类型检查；`pnpm check` = 工作区约束 + lint + 类型检查；`pnpm build` 构建所有已配置构建脚本的包（当前仅 shell，即生产环境包，模块源码随 shell 一并编译）；`pnpm verify` = `check` + 全仓构建。
- 小范围改动可先运行受影响包的最小检查，完成后至少运行 `pnpm check`；代码改动还必须构建受影响包。修改公共包时，运行所有消费方已有的 `typecheck` / `test` / `build`，无法确定消费方时使用 `pnpm verify`。
- `pnpm format:check` 是独立的只读检查，不包含在 `check` / `verify` 中。全仓格式检查若因无关既有文件失败，只对本次变更文件执行 `pnpm exec prettier --check <文件...>`，并在结果中如实列出全仓失败；不得为通过检查批量格式化无关文件。
- `test` 仅在实际配置时执行；没有测试脚本时明确写「自动化测试未配置」。`check` / `verify` 均不代表浏览器交互已验证，也不替代主壳要求的响应式、主题、菜单与沉浸模式走查。
- 命令未配置或未执行时不许假装已验证。最终回复列出主要变更文件、实际执行的命令与结果；既有失败、warning、跳过项和「浏览器交互未验证」等限制必须单独说明。

## 6. 行为边界

- 先读后改：修改任何包前，先读该包的 `package.json` 与相关源码；开始修改前查看 `git status --short`，目标文件已有改动时同时阅读相关 diff，保留用户与并行任务的修改。
- 不覆盖、不回退无关改动；未经用户明确许可，不执行 `git reset --hard`、`git clean -fd`、对无关文件的 `git checkout --` / `git restore`，也不以全仓 `pnpm format` 代替定向修复。
- 不擅自变更架构（如模块间通信方式、构建工具选型）；需要变更时先给方案再动手。
- 文档防漂移：变更内核（`core`）、Provider 接口、模块集成契约或目录结构时，必须同步更新本文件与 `README.md`，包含「内核与两种运行形态」一节的两张 Mermaid 架构图，保持图、文、代码三者一致；验证闭环中需检查文档是否已同步。
- 模块之间不直接互相依赖；共享能力下沉到 `types` / `module` / `common` / `ui`。
- 业务模块不反向依赖 `shell` 内部实现。
- 内核与 Provider 契约（`@kacean/core`，`createAdminKernel`）：
  - 内核职责：模块加载（`loadModules(loader)` 批量注册：disabled 过滤 + 依赖/版本校验 + 依赖拓扑排序；`registerModule` 单模块注册，注册即契约校验）、路由合并、Provider 注册中心（`registerProvider`）。
  - 能力 Provider（接口定义在 `@kacean/types`）：`auth`（登录身份，缺省匿名）、`permission`（权限判断，缺省全部放行）、`menu`（菜单编排过滤，缺省内置实现，可聚合宿主预取的外部菜单）、`layout`（布局骨架渲染，**可选**）。
  - 两种运行形态：注册 `layout` = 独立平台（`kernel.createRouter()` 自动以布局组件为根路由）；不注册 `layout` = 无头 SDK，宿主消费 `getMenus()` / `getRoutes()` / `hasPermission()` 自行渲染，`getRoutes()` 只返回路由描述对象，不创建 router 实例。
  - shell 在 `packages/shell/src/kernel.ts` 完成组装（注册 Provider 与模块）；业务模块不直接依赖 `@kacean/core`，内核集成契约只依赖 `@kacean/types`，通用 UI 可声明 `@kacean/ui` 的 `workspace:*` 依赖。
- 清单加载器抽象（前期按需模式 / 后期 SaaS 平台化，共用同一套内核与契约，不换架构）：
  - **清单描述与模块实现分离**：`ModuleDescriptor`（可 JSON 序列化纯数据：`id`、`version`、`disabled`、`order`、`entry`、`integrity`）描述编排与远程元数据；`AdminModuleManifest`（含组件等代码）是模块实现。loader 输出 `LoadedModule = { descriptor, manifest }`，是内核统一输入。
  - 基座只依赖 `ModuleLoader` 接口（`@kacean/types`）：前期 `StaticLoader`（core 的 `createStaticModuleLoader`），`@kacean/module/vite` 以 shell 的 `workspace:*` 模块依赖为唯一登记点，读取各模块 package.json 的 `kacean.modes` 按 Vite mode 聚合生成静态 import 与 descriptor，创建 loader 前可合并运行时 `disabled/order` 覆盖；后期 `HttpLoader`（平台配置接口 + 远程 ESM 加载）仅替换清单来源，注册编排逻辑不变。**远程 ESM 动态加载分支当前不实现、不开启**。
  - `AdminModuleManifest` 必含 `version`：模块在 `src/index.ts` 调用 `@kacean/module/self` 的 `defineModule`，`name/version` 由插件从模块 package.json 内联生成，不再维护 `src/manifest.ts` 或导入 package.json；`deps`（模块名 -> 版本范围）声明依赖，`disabled` 可被 descriptor 覆盖；descriptor.version 与实现版本不一致时注册失败。
  - 版本范围仅支持 `^` / `~` / 精确版本 / `*`（core 内置轻量匹配，稳定版 x.y.z，不支持 prerelease 与复合范围）；需要完整 semver 语义时再评估引入依赖。
  - 动态启停的卸载契约（`unregister`、路由/store 等副作用回收）为预留演进点，当前未实现，不得假装支持运行时热卸载。
- 模块与 shell 的集成契约（方案 B：模块自描述 + shell 显式注册）：
  - 菜单/模块清单类型统一定义在 `@kacean/types`（`AdminModuleManifest`、`ModuleMenuItem`），纯类型不含运行时代码。
  - 每个业务模块在 `src/index.ts` 从 `@kacean/module/self` 调用 `defineModule({ routes, menus?, permissions?, deps?, disabled? })`，导出标准 `manifest`，有接口时同时导出 `http`。`self` 与绑定的 `defineModule` 由 `@kacean/module/vite` 按 importer 定位所属模块 package.json 后生成，静态元数据含 `name/version/kacean.modes/kacean.http/kacean.servicePath`；公共代码与非登记模块不得导入 `/self`。真实业务模块只提供路由与页面组件，菜单和用户权限由 shell Provider 统一管理；template-module 的静态工作台、菜单、`group` 与菜单权限声明统一在 `src/menus.ts` 和 `src/index.ts` 维护，shell 不维护内置静态页面 manifest。
  - shell 在 `packages/shell/src/modules.ts` 消费 `virtual:kacean-module-registry` 并创建 StaticLoader。该虚拟模块由 `@kacean/module/vite` 构建期聚合生成，不扫描目录：以 shell package.json 中指向 `packages/modules/*` 的 `workspace:*` 依赖为唯一登记点，读取各模块 package.json 的 `kacean.modes`（`development` / `production` / `demo`）确定模式归属，默认注册顺序按 id 字典序；demo 仅生成、导入并注册声明 `demo` 的 template-module，development / production 仅生成、导入并注册声明对应模式的真实业务模块，module-dev 仅生成、导入并注册 `VITE_DEV_MODULE` 指定模块，非当前模式页面 chunk 不进入产物。新增模块只需登记 shell package 依赖并在自身 package.json 声明 `kacean.modes`，不再维护第二份清单或 `moduleImporters`；模块 package.json 由插件按文件读取，变更后需重启开发服务器，构建日志会打印当前模式挂载清单（id@version）供核对。虚拟模块同时导出 `registeredModuleNames` 与当前模式候选集的 `moduleDescriptors`（id/version），`src/modules.ts` 据此校验 `modules.<id>` 覆盖键，先调用 `registerModuleRuntimeOverrides` 注入部署配置，再动态 import 模块并合并 descriptor 的 `disabled/order`；`src/config.ts` 合并 `config.js` 的 `modules` 与 `VITE_DISABLED_MODULES`。运行时覆盖不能增加未纳入模式的模块，模块侧不声明 order。经内核 `loadModules` 注册后由 MenuProvider 统一聚合当前模式的模板静态菜单或外部业务菜单（PermissionProvider 权限过滤 + `order` 排序），模块不直接操作 shell 菜单。修改 `config.js` 刷新页面后生效，直接修改 `window.__KACEAN_CONFIG__` 不热重建模块。
  - shell `src/providers/menu.ts` 是外部业务菜单接入点：dev / prod 与真实业务模块的 module-dev 支持内置本地、`config.js` 的 `menus.items` 或远程菜单接口（`local/config/remote`，远程复用统一 HttpClient 与 `ApiResponse<ModuleMenuItem[]>` 契约）；demo 与 template-module 的 module-dev 不加载业务菜单，单模块开发会静默过滤其他模块菜单。`src/providers/permission.ts` 默认全部放行，真实用户权限 HTTP 请求后续逐步接入。`main.ts` 须等待 `shellReady`（模块注册 + 菜单初始化）后创建 Router，不能在同步 Provider 的 `resolve` / `hasPermission` 中临时发异步请求。
  - shell 部署配置集中在 `src/config.ts` 解析。模块 package.json 的 `kacean.servicePath` 支持字符串（默认服务）或 key-value 对象（多服务），`kacean.http` 声明模块默认 `origin/basePath`；`@kacean/module` 生成可调用的 `http()` 默认 client 与 `http.for(key)` 服务 client。`servicePath` 按 `modules.<id>.services.<key>.servicePath` > 模块 package.json 默认值解析；`origin/basePath` 逐字段按 `modules.<id>.services.<key>.http` > `modules.<id>.http` > `kacean.http` > 全局 `http.origin/basePath` 解析，全局再按运行时 `config.js` > `VITE_HTTP_ORIGIN` / `VITE_HTTP_BASE_PATH` > 默认同源与 `/api` 回退。未配置表示继承，显式空路径、非法路径、未知模块或服务 key 均报错；配置不能新增模块或服务。`modules.<id>` 同时承载 `disabled/order/http/services`，不设置顶层 `services`。多服务无默认服务时直接 `http()` 报错，必须显式 `http.for(key)`。shell 自身的远程菜单请求通过 `menus.http` 覆盖地址，不占用业务模块配置。其他配置按运行时覆盖 > 构建环境变量 > 代码默认值解析。`VITE_APP_BASE_PATH` 与 `VITE_BUILD_OUT_DIR` 始终为构建期配置；Provider 实现、模块 import、路由组件与启动编排不得放入 `config.js`，所有配置均为公开数据。
  - 菜单项 `path` 即路由路径；`icon` 为图标名，由 shell 统一映射，模块不直接依赖图标库；`permission` 为权限码，由 `PermissionProvider` 过滤；模块静态菜单的权限码应在同模块 manifest 的 `permissions` 中申报，动态菜单权限码由外部数据源下发；`group` 为顶层菜单分组标题（如「操作空间」「系统管理」），同名分组跨模块合并，仅用于侧栏视觉归类，不参与路由与权限判断。
  - 模块声明静态 `menus` 时，`routes` 与 `menus` 同源：叶子菜单 path 必须有对应路由（注册时内核校验，含子菜单的父节点不强制）；外部动态菜单由 shell 初始化时校验，未注册或已停用模块的叶子菜单过滤并告警。详情页等可只进 `routes` 不进菜单。路由由内核合并，`packages/shell/src/router.ts` 调 `kernel.createRouter()` 生成，`component` 推荐 `() => import(...)` 懒加载。动态菜单过滤不等于路由访问鉴权，直接 URL 访问守卫需单独实现。
  - 模块集成链路：所有模块统一以 shell 为底座，模块 `exports` 指向 TS/TSX 源码，shell 静态集成与无头宿主的构建期集成均由消费方 Vite 统一编译；模块不提供独立构建脚本与 ESM 库产物，不做跨仓库分发，已构建 shell 不在运行时加载模块 `dist`。
  - 模块开发（`dev:module`）统一使用 shell 的 module-dev 单模块模式，直接从模块 manifest 生成路由与菜单，复用基座全局 TDesign 样式、Provider 和 HTTP 配置；模块不再维护 `src/dev/` 调试壳、页面映射或 `index.html`，正式源码也不依赖 shell。
- 壳层可选注入：全局右侧面板（`SidePanel` + `PanelController`）：
  - 共享组件 `SidePanel`（`@kacean/ui`）是唯一面板实现：受控 `visible` / `collapsed` / `width` / `title` / `mode`；`dock` 在 flex 行容器内占位推挤、收缩为 40px 把手条，`overlay` 为 fixed 抽屉（滑入滑出过渡 + 遮罩淡入淡出，`mask=false` 时不渲染遮罩、面板外区域可交互，`closeOnOverlayClick` 控制点遮罩关闭）；slots `title` / `extra` / `default` / `footer` / `collapsed`，事件 `close` / `update:collapsed`，`showClose` / `showCollapse` 分别控制关闭与收缩按钮显示（默认均显示），支持 Esc 关闭（捕获阶段拦截，避免误触发宿主快捷键）。`AppDrawer` 是同一实现的 overlay 适配器，保留 `v-model:visible` 并复用相同插槽，不另建 TDesign Drawer 面板。
  - 页面级详情由模块自行使用 `SidePanel`；壳层全局面板由 shell `src/providers/globalPanel.tsx` 组合同一组件（dock 位于内容区右侧、顶栏贯通，沉浸模式可用，窄屏自动 overlay），宽度与收缩状态持久化于 `kacean-admin.global-panel`，路由切换默认自动关闭（`closeOnRouteChange: false` 可覆盖）。
  - 模块 → 壳层走可选注入而非内核 Provider：`PanelController` / `PanelOpenOptions` 类型在 `@kacean/types`，注入 key `PANEL_CONTROLLER_KEY` 在 `@kacean/ui`（与 SidePanel 实现同包；types 为纯类型包，不含运行时 Symbol）；shell 在布局根部 provide，无头宿主可自行提供同接口实现；模块必须 `inject(PANEL_CONTROLLER_KEY, undefined)` 并做本地 `SidePanel` 降级，参考 template-module `DetailLayout.tsx`。
  - 面板内容以「组件 + props」传入（`open({ title, component, props })`），`SidePanel` 不持有业务数据；core 与两种运行形态不变。
  - 新增或修改 `template-module` 模板页、维护其共享组件时，使用 `.agents/skills/kacean-template-module/SKILL.md`；组件 API 与流程参考其 `references/shared-components.md`。公共组件契约变化必须同步 Skill 参考、本文件与 `README.md`。
- 样式与主题约束（token 统一走 TDesign，不另建自有 token 层）：
  - 业务模块与 ui 的自定义样式只允许引用 TDesign token（`--td-*`）或 `uno.config.ts` 中映射到 token 的语义原子类（`text-primary` / `bg-page` / `text-secondary` 等），禁止硬编码主题相关色值（默认色板类如 `text-gray-500`、`bg-emerald-500`，十六进制色值等）。
  - 主题定制集中在两处：独立平台改 shell `src/styles/theme.css`（覆盖 `--td-*`）；无头嵌入（含 WC）由宿主在自身样式表覆盖同名变量，CSS 自定义属性沿 DOM 继承，模块整体跟随。模块自身不得覆盖 `--td-*`。
  - 品牌主题由根节点 `data-brand-theme` 切换（`default` / `energy-blue` / `sgcc-green` / `vibrant-orange`），与明暗模式（`theme-mode`）正交；新增配色只在 `theme.css` 内以同名属性选择器扩展，模块不自建主题。
  - 组件库 props（如 `theme="primary"`）不受此限；WC + Shadow DOM 嵌入时模块样式表需注入 shadow root，变量可穿透继承。
  - 新增语义原子类时同步 shell 与 template-module 两份 `uno.config.ts`，保持模块独立构建与 shell 集成表现一致。
- 独立平台固定视觉与布局约定（除非用户明确要求，不随页面或任务改变整体风格）：
  - 使用浅色、简洁、克制的企业后台风格；统一卡片圆角、边框、间距和字体层级，不随意改成深色侧栏、高饱和渐变或夸张阴影。
  - 主壳采用 `100dvh` 固定应用壳：默认左侧栏全高、右侧顶栏高 `72px`，支持切换顶部导航、只显示内容区的沉浸模式与品牌主题（默认 / 能源蓝 / 国网绿 / 活力橙）；仅主内容区独立滚动，页面 `body` 不滚动，优先用 Flex 固定壳层，不用 `position: fixed` 让顶栏脱离文档流。
  - 展开侧栏宽 `248px`，折叠宽 `72px`；主内容区水平内边距默认 `28px`，窄屏按现有断点收敛，内容最大宽度 `1600px`。
  - 菜单必须递归支持 `children` 子菜单：父节点负责展开/收起，叶子节点负责路由跳转；当前子路由自动展开并高亮父级，折叠侧栏时子菜单使用不被侧栏裁剪的弹层，禁止拍平菜单树。
  - 侧栏顶层菜单按 `group` 展示分组标题，分组不与子菜单混用：工作台、两票管理与模板演示归「操作空间」，账号与菜单管理归「系统管理」，shell 不预置系统管理占位菜单；顶部导航空间有限时保持扁平渲染，不丢失入口。
  - 菜单只保留一个纵向滚动区域；可隐藏滚动条外观，但必须保留滚轮、触摸和键盘可达性，禁止用 `overflow: hidden` 直接裁掉超长菜单或子菜单。
  - 顶栏在界面设置按钮旁提供沉浸模式快捷入口，设置弹层保留同名开关；沉浸模式右上角操作区默认收起为低干扰小按钮，鼠标悬停、键盘聚焦或点击后展开完整操作；鼠标移出、焦点离开或点击外部自动收起，`Esc` 退出沉浸模式。
  - 修改主壳后至少检查：多级菜单跳转、直接访问子路由、侧栏折叠弹层、顶部菜单溢出、超长菜单滚动、内容滚动时顶栏固定、主题切换、沉浸模式进入与退出、窄屏布局，并执行受影响包的验证脚本。
- 可见回复使用简体中文；代码、命令、字段名保持原文。
