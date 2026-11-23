# kacean-admin — Agent 工作规范

本文件是本仓库对 AI coding agent 的**项目级约束**，优先级高于通用习惯。
开始任何任务前，先读本文件和涉及包的 `package.json`。

## 1. 项目定位

- pnpm monorepo（pnpm 10.34.9，见根 `package.json` 的 `packageManager`）。
- 技术栈：Vue 3 + TypeScript + Vite，shell 与业务模块统一。
- 架构：**shell 主应用 + 可独立开发/构建的业务模块（modules）+ 公共包**。
- 工作区声明见 `pnpm-workspace.yaml`：`packages/*`、`packages/modules/*`。

## 2. 目录约定

```
kacean-admin/
├─ .agents/skills/kacean-template-module/ # 模板页开发 Skill 与共享组件参考
├─ .agents/skills/kacean-module-http/     # 模块 HTTP 接入 Skill（逻辑服务 key 声明、跨模块/跨服务与降级）
├─ packages/
│  ├─ shell/              # 主壳应用（独立平台组装层：注册 Provider + 业务模块）
│  ├─ core/               # 内核 @kacean/core：模块加载、契约校验、Provider 注册中心、路由/菜单合并
│  ├─ admin-module-types/ # 共享 TypeScript 类型定义（纯类型，不含运行时代码）
│  ├─ common/             # 共享通用逻辑：工具函数、常量、HTTP 请求封装（fetch，多 baseURL + HttpAuthProvider 鉴权抽象）等（无 UI）
│  ├─ shared-components/  # 共享 UI 组件
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

- `packages/` 下子包固定为 `shell`、`core`、`admin-module-types`、`common`、`shared-components`，新增同级子包需先确认，并同步 `scripts/check-workspace.mjs` 的固定包清单。
- `packages/modules/` 下每一个文件夹都是**独立业务插件模块**：独立开发、独立构建，通过 `pnpm dev:module <模块名>` / `pnpm build:module <模块名>` 操作。
- 包名规则：公共包统一使用 `@kacean/*` scope——`@kacean/types`（目录 `admin-module-types`）、`@kacean/core`、`@kacean/common`、`@kacean/shared`（目录 `shared-components`）；`shell` 与业务模块的包名与目录名一致。
- `pnpm --filter` 使用完整包名，如 `pnpm --filter @kacean/common build`。
- 新增模块后，必须同步更新本文件与 `README.md` 的结构说明。
- 不擅自引入上述之外的顶层目录。

## 3. 命令契约（统一入口，不绕过）

| 操作           | 命令                             |
| -------------- | -------------------------------- |
| 安装依赖       | `pnpm install`（只在根目录执行） |
| 开发主壳       | `pnpm dev:shell`                 |
| 联调开发主壳   | `pnpm dev:shell:integration`     |
| 构建主壳       | `pnpm build:shell`               |
| 纯静态构建     | `pnpm build:static`              |
| 前后联调构建   | `pnpm build:integration`         |
| 开发某模块     | `pnpm dev:module <模块名>`       |
| 构建某模块     | `pnpm build:module <模块名>`     |
| 全仓构建       | `pnpm build`                     |
| 全仓类型检查   | `pnpm typecheck`                 |
| 工作区约束检查 | `pnpm check:workspace`           |
| 静态检查       | `pnpm check`                     |
| 完整本地验证   | `pnpm verify`                    |
| 全仓 lint      | `pnpm lint`                      |
| 格式只读检查   | `pnpm format:check`              |
| 全仓格式化     | `pnpm format`                    |

- 跨包操作一律用 `pnpm --filter <包名> <脚本>`，不 `cd` 进包内单独装依赖。
- `build:static` / `build:integration` 递归执行各包已配置的同名脚本；当前 static 覆盖 shell 与 template-module，integration 仅覆盖 shell，均输出到各自 `dist`。默认 `build` 与 static 仅在 shell 挂载纯静态 `template-module`；integration 仅挂载 `account-management`、`data-dict-management`、`menu-management`、`two-ticket-management` 及后续登记的真实业务模块，不加载模板菜单、路由与模块实现。`template-module` 不判断 `integration`、不提供联调脚本或接口分支。真实业务模块的服务 baseURL 统一由 shell `src/services.config.ts` 配置，禁止在模块视图中硬编码。

## 4. 依赖规则（收敛重点）

- 包之间引用一律 `"workspace:*"`，禁止写死版本号、禁止相对路径跨包 import 源码。
- 公共包通过包名引入：`@kacean/types`、`@kacean/core`、`@kacean/common`、`@kacean/shared`（根 `tsconfig.json` 已配置 paths 指向各包 `src`）。
- 依赖装到**实际使用它的包**：`pnpm --filter <包名> add <依赖>`。
- 根 `package.json` 只放工程化公共 devDependencies（lint、format 等），业务依赖禁止装根目录。
- 新增第三方依赖前先说明用途与体积影响，不擅自加装。
- 公共包（types / core / common / shared）以 TS/Vue **源码直接导出**（`exports` 指向 `src/index.ts`），由消费方的 Vite 统一编译，公共包自身不需要 `build`；`types` 为纯类型包。
- `shared-components` 收敛通用页面骨架、组合组件与轻量表单字段/弹框；`template-module` 的页面容器、卡片、表格、分页、树形展示（`AppTree`）、表单布局、详情布局、`Form*` 字段组件（含日期面板与 Calendar 日历板）和 `AppDialog` / `ConfirmDialog` / `AppDrawer` 优先使用 `@kacean/shared`。完整数据列表页使用 `DataTableTemplate`（统一页头、上方查询条件区、下方列表区域与底部分页，占满 main 可用高度且仅表格内容区滚动），表格与分页的轻量组合使用 `PaginatedTable`。`Button`、`Tag`、`Alert` 等未封装原子组件直接使用 TDesign。共享组件不包含模块名、示例字段、mock 数据或上传请求。

## 5. 验证闭环（自主能力基础）

- `shell` 与业务模块必须提供 `dev`、`build`、`typecheck`；公共包以源码直出，不强制提供 `dev` / `build`，其源码由消费方编译，已有 `typecheck` / `test` 必须执行。
- 工作区已有改动或任务可能影响核心、共享代码时，修改前先运行最小验证作为基线；修改后根据 diff 和报错位置区分本次引入与既有问题，不通过新增忽略规则、降低类型要求或删除测试掩盖失败。
- 统一入口：`pnpm check:workspace` 检查包名、内部依赖协议与方向、模块标准脚本和 shell 清单依赖；`pnpm typecheck` 执行所有已配置的类型检查；`pnpm check` = 工作区约束 + lint + 类型检查；`pnpm build` 构建所有已配置构建脚本的包；`pnpm verify` = `check` + 全仓构建。
- 小范围改动可先运行受影响包的最小检查，完成后至少运行 `pnpm check`；代码改动还必须构建受影响包。修改公共包时，运行所有消费方已有的 `typecheck` / `test` / `build`，无法确定消费方时使用 `pnpm verify`。
- `pnpm format:check` 是独立的只读检查，不包含在 `check` / `verify` 中。全仓格式检查若因无关既有文件失败，只对本次变更文件执行 `pnpm exec prettier --check <文件...>`，并在结果中如实列出全仓失败；不得为通过检查批量格式化无关文件。
- `test` 仅在实际配置时执行；没有测试脚本时明确写「自动化测试未配置」。`check` / `verify` 均不代表浏览器交互已验证，也不替代主壳要求的响应式、主题、菜单与沉浸模式走查。
- 命令未配置或未执行时不许假装已验证。最终回复列出主要变更文件、实际执行的命令与结果；既有失败、warning、跳过项和「浏览器交互未验证」等限制必须单独说明。

## 6. 行为边界

- 先读后改：修改任何包前，先读该包的 `package.json` 与相关源码；开始修改前查看 `git status --short`，目标文件已有改动时同时阅读相关 diff，保留用户与并行任务的修改。
- 不覆盖、不回退无关改动；未经用户明确许可，不执行 `git reset --hard`、`git clean -fd`、对无关文件的 `git checkout --` / `git restore`，也不以全仓 `pnpm format` 代替定向修复。
- 不擅自变更架构（如模块间通信方式、构建工具选型）；需要变更时先给方案再动手。
- 文档防漂移：变更内核（`core`）、Provider 接口、模块集成契约或目录结构时，必须同步更新本文件与 `README.md`，包含「内核与两种运行形态」一节的两张 Mermaid 架构图，保持图、文、代码三者一致；验证闭环中需检查文档是否已同步。
- 模块之间不直接互相依赖；共享能力下沉到 `types` / `common` / `shared-components`。
- 业务模块不反向依赖 `shell` 内部实现。
- 内核与 Provider 契约（`@kacean/core`，`createAdminKernel`）：
  - 内核职责：模块加载（`loadModules(loader)` 批量注册：disabled 过滤 + 依赖/版本校验 + 依赖拓扑排序；`registerModule` 单模块注册，注册即契约校验）、路由合并、Provider 注册中心（`registerProvider`）。
  - 能力 Provider（接口定义在 `@kacean/types`）：`auth`（登录身份，缺省匿名）、`permission`（权限判断，缺省全部放行）、`menu`（菜单编排过滤，缺省内置实现，可聚合宿主预取的外部菜单）、`layout`（布局骨架渲染，**可选**）。
  - 两种运行形态：注册 `layout` = 独立平台（`kernel.createRouter()` 自动以布局组件为根路由）；不注册 `layout` = 无头 SDK，宿主消费 `getMenus()` / `getRoutes()` / `hasPermission()` 自行渲染，`getRoutes()` 只返回路由描述对象，不创建 router 实例。
  - shell 在 `packages/shell/src/kernel.ts` 完成组装（注册 Provider 与模块）；业务模块不直接依赖 `@kacean/core`，内核集成契约只依赖 `@kacean/types`，通用 UI 可声明 `@kacean/shared` 的 `workspace:*` 依赖。
- 清单加载器抽象（前期按需模式 / 后期 SaaS 平台化，共用同一套内核与契约，不换架构）：
  - **清单描述与模块实现分离**：`ModuleDescriptor`（可 JSON 序列化纯数据：`id`、`version`、`disabled`、`order`、`entry`、`integrity`、`global`）描述编排与远程元数据；`AdminModuleManifest`（含组件等代码）是模块实现。loader 输出 `LoadedModule = { descriptor, manifest }`，是内核统一输入。
  - 基座只依赖 `ModuleLoader` 接口（`@kacean/types`）：前期 `StaticLoader`（core 的 `createStaticModuleLoader`，静态 import 实现 + shell `src/modules.config.json` 配置启停/顺序）；后期 `HttpLoader`（平台配置接口 + 远程 UMD 加载）仅替换清单来源，注册编排逻辑不变。**远程 UMD 动态加载分支当前不实现、不开启**。
  - `AdminModuleManifest` 必含 `version`（与模块 package.json 同步），`deps`（模块名 -> 版本范围）声明依赖，`disabled` 可被 descriptor 覆盖；descriptor.version 与实现版本不一致时注册失败。
  - 版本范围仅支持 `^` / `~` / 精确版本 / `*`（core 内置轻量匹配，稳定版 x.y.z，不支持 prerelease 与复合范围）；需要完整 semver 语义时再评估引入依赖。
  - 动态启停的卸载契约（`unregister`、路由/store 等副作用回收）为预留演进点，当前未实现，不得假装支持运行时热卸载。
- 模块与 shell 的集成契约（方案 B：模块自描述 + shell 显式注册）：
  - 菜单/模块清单类型统一定义在 `@kacean/types`（`AdminModuleManifest`、`ModuleMenuItem`），纯类型不含运行时代码。
  - 每个业务模块在自身包内导出 `manifest`（含 `name`、`version`、`routes`，`menus` 可选）。真实业务模块只提供路由与页面组件，菜单和用户权限由 shell Provider 统一管理；template-module 的静态工作台、菜单、`group` 与菜单权限声明统一在 `src/menus.ts` 和 `src/manifest.ts` 维护，shell 不维护内置静态页面 manifest。
  - shell 在 `packages/shell/src/modules.ts` 按模式显式登记各模块 manifest 并创建 StaticLoader（清单配置 `modules.config.json`）：默认 / static 仅导入、注册 template-module，integration 仅导入、注册真实业务模块。经内核 `loadModules` 注册后由 MenuProvider 统一聚合当前模式的模板静态菜单或外部业务菜单（PermissionProvider 权限过滤 + `order` 排序），模块不直接操作 shell 菜单。显式配置清单时，已引入但未登记的模块会报错，防止漏配静默丢失。
  - shell `src/providers/menu.ts` 是外部业务菜单接入点：仅 integration 使用本地降级数据，默认 / static 不加载业务菜单；`src/providers/permission.ts` 默认全部放行，真实菜单/权限 HTTP 请求后续逐步接入。`main.ts` 须等待 `shellReady`（模块注册 + 菜单初始化）后创建 Router，不能在同步 Provider 的 `resolve` / `hasPermission` 中临时发异步请求。
  - 菜单项 `path` 即路由路径；`icon` 为图标名，由 shell 统一映射，模块不直接依赖图标库；`permission` 为权限码，由 `PermissionProvider` 过滤；模块静态菜单的权限码应在同模块 manifest 的 `permissions` 中申报，动态菜单权限码由外部数据源下发；`group` 为顶层菜单分组标题（如「操作空间」「系统管理」），同名分组跨模块合并，仅用于侧栏视觉归类，不参与路由与权限判断。
  - 模块声明静态 `menus` 时，`routes` 与 `menus` 同源：叶子菜单 path 必须有对应路由（注册时内核校验，含子菜单的父节点不强制）；外部动态菜单由 shell 初始化时校验，未注册或已停用模块的叶子菜单过滤并告警。详情页等可只进 `routes` 不进菜单。路由由内核合并，`packages/shell/src/router.ts` 调 `kernel.createRouter()` 生成，`component` 推荐 `() => import(...)` 懒加载。动态菜单过滤不等于路由访问鉴权，直接 URL 访问守卫需单独实现。
  - 双产物链路：模块 `exports` 指向 TS/TSX 源码，shell 静态集成时由 shell 的 Vite 统一编译；模块自身 `build` 产出 ESM（`<模块名>.es.js`）与 UMD（`<模块名>.umd.js`）双产物，UMD 挂 `window.<模块名 PascalCase>` 并暴露 `manifest`，`vue` / `tdesign-vue-next` 外部化为全局 `Vue` / `TDesign`，`@kacean/shared` 源码随模块产物打包，供 shell 后续的 UMD 模块加载器远程加载；构建后由包内脚本生成 `dist/manifest.json`（`id` / `version` / `entry` / `integrity` / `global`，含 UMD 产物 SRI 校验值），作为后期 HttpLoader 的远程元数据格式，前期静态模式不消费。参考 `template-module`。
  - 模块独立开发（`dev:module`）使用自带简易开发壳（`src/dev/`），不依赖 shell；TDesign 样式仅独立开发时自行引入，集成时由基座全局注入。
- 壳层可选注入：全局右侧面板（`SidePanel` + `PanelController`）：
  - 共享组件 `SidePanel`（`@kacean/shared`）是唯一面板实现：受控 `visible` / `collapsed` / `width` / `title` / `mode`；`dock` 在 flex 行容器内占位推挤、收缩为 40px 把手条，`overlay` 为 fixed 抽屉（滑入滑出过渡 + 遮罩淡入淡出，`mask=false` 时不渲染遮罩、面板外区域可交互，`closeOnOverlayClick` 控制点遮罩关闭）；slots `title` / `extra` / `default` / `footer` / `collapsed`，事件 `close` / `update:collapsed`，`showClose` / `showCollapse` 分别控制关闭与收缩按钮显示（默认均显示），支持 Esc 关闭（捕获阶段拦截，避免误触发宿主快捷键）。`AppDrawer` 是同一实现的 overlay 适配器，保留 `v-model:visible` 并复用相同插槽，不另建 TDesign Drawer 面板。
  - 页面级详情由模块自行使用 `SidePanel`；壳层全局面板由 shell `src/providers/globalPanel.tsx` 组合同一组件（dock 位于内容区右侧、顶栏贯通，沉浸模式可用，窄屏自动 overlay），宽度与收缩状态持久化于 `kacean-admin.global-panel`，路由切换默认自动关闭（`closeOnRouteChange: false` 可覆盖）。
  - 模块 → 壳层走可选注入而非内核 Provider：`PanelController` / `PanelOpenOptions` 类型在 `@kacean/types`，注入 key `PANEL_CONTROLLER_KEY` 在 `@kacean/common`（types 为纯类型包，不含运行时 Symbol）；shell 在布局根部 provide，无头宿主可自行提供同接口实现；模块必须 `inject(PANEL_CONTROLLER_KEY, undefined)` 并做本地 `SidePanel` 降级，参考 template-module `DetailLayout.tsx`。
  - 面板内容以「组件 + props」传入（`open({ title, component, props })`），`SidePanel` 不持有业务数据；core 与两种运行形态不变。
  - 新增或修改 `template-module` 模板页、维护其共享组件时，使用 `.agents/skills/kacean-template-module/SKILL.md`；组件 API 与流程参考其 `references/shared-components.md`。公共组件契约变化必须同步 Skill 参考、本文件与 `README.md`。
- 样式与主题约束（token 统一走 TDesign，不另建自有 token 层）：
  - 业务模块与 shared-components 的自定义样式只允许引用 TDesign token（`--td-*`）或 `uno.config.ts` 中映射到 token 的语义原子类（`text-primary` / `bg-page` / `text-secondary` 等），禁止硬编码主题相关色值（默认色板类如 `text-gray-500`、`bg-emerald-500`，十六进制色值等）。
  - 主题定制集中在两处：独立平台改 shell `src/styles/theme.css`（覆盖 `--td-*`）；无头嵌入（WC / UMD）由宿主在自身样式表覆盖同名变量，CSS 自定义属性沿 DOM 继承，模块整体跟随。模块自身不得覆盖 `--td-*`。
  - 品牌主题由根节点 `data-brand-theme` 切换（`default` / `energy-blue` / `sgcc-green` / `vibrant-orange`），与明暗模式（`theme-mode`）正交；新增配色只在 `theme.css` 内以同名属性选择器扩展，模块不自建主题。
  - 组件库 props（如 `theme="primary"`）不受此限；WC + Shadow DOM 嵌入时模块样式表需注入 shadow root，变量可穿透继承。
  - 新增语义原子类时同步 shell 与 template-module 两份 `uno.config.ts`，保持独立开发与集成表现一致。
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
