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
├─ packages/
│  ├─ shell/              # 主壳应用（独立平台组装层：注册 Provider + 业务模块）
│  ├─ core/               # 内核 @kacean/core：模块加载、契约校验、Provider 注册中心、路由/菜单合并
│  ├─ admin-module-types/ # 共享 TypeScript 类型定义（纯类型，不含运行时代码）
│  ├─ common/             # 共享通用逻辑：工具函数、常量等（无 UI）
│  ├─ shared-components/  # 共享 UI 组件
│  └─ modules/
│     ├─ demo-module/      # 示例模块模板（双产物：ESM + UMD）
│     └─ <模块名>/         # 独立业务插件模块，每一个文件夹就是一个模块
├─ scripts/               # 工程化脚本（run-module.mjs：dev:module / build:module 命令转发）
├─ AGENTS.md              # 本文件
└─ pnpm-workspace.yaml
```

- `packages/` 下子包固定为 `shell`、`core`、`admin-module-types`、`common`、`shared-components`，新增同级子包需先确认。
- `packages/modules/` 下每一个文件夹都是**独立业务插件模块**：独立开发、独立构建，通过 `pnpm dev:module <模块名>` / `pnpm build:module <模块名>` 操作。
- 包名规则：公共包统一使用 `@kacean/*` scope——`@kacean/types`（目录 `admin-module-types`）、`@kacean/core`、`@kacean/common`、`@kacean/shared`（目录 `shared-components`）；`shell` 与业务模块的包名与目录名一致。
- `pnpm --filter` 使用完整包名，如 `pnpm --filter @kacean/common build`。
- 新增模块后，必须同步更新本文件与 `README.md` 的结构说明。
- 不擅自引入上述之外的顶层目录。

## 3. 命令契约（统一入口，不绕过）

| 操作       | 命令                             |
| ---------- | -------------------------------- |
| 安装依赖   | `pnpm install`（只在根目录执行） |
| 开发主壳   | `pnpm dev:shell`                 |
| 构建主壳   | `pnpm build:shell`               |
| 开发某模块 | `pnpm dev:module <模块名>`       |
| 构建某模块 | `pnpm build:module <模块名>`     |
| 全仓 lint  | `pnpm lint`                      |
| 全仓格式化 | `pnpm format`                    |

- 跨包操作一律用 `pnpm --filter <包名> <脚本>`，不 `cd` 进包内单独装依赖。

## 4. 依赖规则（收敛重点）

- 包之间引用一律 `"workspace:*"`，禁止写死版本号、禁止相对路径跨包 import 源码。
- 公共包通过包名引入：`@kacean/types`、`@kacean/core`、`@kacean/common`、`@kacean/shared`（根 `tsconfig.json` 已配置 paths 指向各包 `src`）。
- 依赖装到**实际使用它的包**：`pnpm --filter <包名> add <依赖>`。
- 根 `package.json` 只放工程化公共 devDependencies（lint、format 等），业务依赖禁止装根目录。
- 新增第三方依赖前先说明用途与体积影响，不擅自加装。
- 公共包（types / core / common / shared）以 TS/Vue **源码直接导出**（`exports` 指向 `src/index.ts`），由消费方的 Vite 统一编译，公共包自身不需要 `build`；`types` 为纯类型包。

## 5. 验证闭环（自主能力基础）

- 每个包必须提供标准脚本：`dev`、`build`；逐步补齐 `lint`、`typecheck`、`test`。
- 改动代码后，必须运行受影响包的 `build`（以及已配置的 `lint`/`typecheck`/`test`）验证，失败要修到通过或如实上报。
- 命令未配置时不许假装已验证，直接说明「未验证」。

## 6. 行为边界

- 先读后改：修改任何包前，先读该包的 `package.json` 与相关源码。
- 不擅自变更架构（如模块间通信方式、构建工具选型）；需要变更时先给方案再动手。
- 文档防漂移：变更内核（`core`）、Provider 接口、模块集成契约或目录结构时，必须同步更新本文件与 `README.md`，包含「内核与两种运行形态」一节的两张 Mermaid 架构图，保持图、文、代码三者一致；验证闭环中需检查文档是否已同步。
- 模块之间不直接互相依赖；共享能力下沉到 `types` / `common` / `shared-components`。
- 业务模块不反向依赖 `shell` 内部实现。
- 内核与 Provider 契约（`@kacean/core`，`createAdminKernel`）：
  - 内核职责：模块加载（`registerModule`，注册即契约校验）、路由合并、Provider 注册中心（`registerProvider`）。
  - 能力 Provider（接口定义在 `@kacean/types`）：`auth`（登录身份，缺省匿名）、`permission`（权限判断，缺省全部放行）、`menu`（菜单编排过滤，缺省内置实现）、`layout`（布局骨架渲染，**可选**）。
  - 两种运行形态：注册 `layout` = 独立平台（`kernel.createRouter()` 自动以布局组件为根路由）；不注册 `layout` = 无头 SDK，宿主消费 `getMenus()` / `getRoutes()` / `hasPermission()` 自行渲染，`getRoutes()` 只返回路由描述对象，不创建 router 实例。
  - shell 在 `packages/shell/src/kernel.ts` 完成组装（注册 Provider 与模块），业务模块不直接依赖 `@kacean/core`，只依赖 `@kacean/types`。
- 模块与 shell 的集成契约（方案 B：模块自描述 + shell 显式注册）：
  - 菜单/模块清单类型统一定义在 `@kacean/types`（`AdminModuleManifest`、`ModuleMenuItem`），纯类型不含运行时代码。
  - 每个业务模块在自身包内导出 `manifest`（含 `name`、`menus`），菜单数据随模块代码维护，不集中到 shell。
  - shell 在 `packages/shell/src/modules.ts` 显式登记各模块 manifest，经内核 `registerModule` 注册后由 MenuProvider 统一聚合（PermissionProvider 权限过滤 + `order` 排序），模块不直接操作 shell 菜单。
  - 菜单项 `path` 即路由路径；`icon` 为图标名，由 shell 统一映射，模块不直接依赖图标库；`permission` 为权限码，由 `PermissionProvider` 过滤，且应在模块 manifest 的 `permissions` 中申报。
  - manifest 的 `routes` 与 `menus` 同源：叶子菜单 path 必须有对应路由（注册时内核校验，含子菜单的父节点不强制）；详情页等可只进 `routes` 不进菜单。路由由内核合并，`packages/shell/src/router.ts` 调 `kernel.createRouter()` 生成，`component` 推荐 `() => import(...)` 懒加载。
  - 双产物链路：模块 `exports` 指向 TS/TSX 源码，shell 静态集成时由 shell 的 Vite 统一编译；模块自身 `build` 产出 ESM（`<模块名>.es.js`）与 UMD（`<模块名>.umd.js`）双产物，UMD 挂 `window.<模块名 PascalCase>` 并暴露 `manifest`，`vue` / `tdesign-vue-next` 外部化为全局 `Vue` / `TDesign`，供 shell 后续的 UMD 模块加载器远程加载。参考 `demo-module`。
  - 模块独立开发（`dev:module`）使用自带简易开发壳（`src/dev/`），不依赖 shell；TDesign 样式仅独立开发时自行引入，集成时由基座全局注入。
- 样式与主题约束（token 统一走 TDesign，不另建自有 token 层）：
  - 业务模块与 shared-components 的自定义样式只允许引用 TDesign token（`--td-*`）或 `uno.config.ts` 中映射到 token 的语义原子类（`text-primary` / `bg-page` / `text-secondary` 等），禁止硬编码主题相关色值（默认色板类如 `text-gray-500`、`bg-emerald-500`，十六进制色值等）。
  - 主题定制集中在两处：独立平台改 shell `src/styles/theme.css`（覆盖 `--td-*`）；无头嵌入（WC / UMD）由宿主在自身样式表覆盖同名变量，CSS 自定义属性沿 DOM 继承，模块整体跟随。模块自身不得覆盖 `--td-*`。
  - 组件库 props（如 `theme="primary"`）不受此限；WC + Shadow DOM 嵌入时模块样式表需注入 shadow root，变量可穿透继承。
  - 新增语义原子类时同步 shell 与 demo-module 两份 `uno.config.ts`，保持独立开发与集成表现一致。
- 独立平台固定视觉与布局约定（除非用户明确要求，不随页面或任务改变整体风格）：
  - 使用浅色、简洁、克制的企业后台风格；统一卡片圆角、边框、间距和字体层级，不随意改成深色侧栏、高饱和渐变或夸张阴影。
  - 主壳采用 `100dvh` 固定应用壳：默认左侧栏全高、右侧顶栏高 `72px`，支持切换顶部导航与只显示内容区的大屏模式；仅主内容区独立滚动，页面 `body` 不滚动，优先用 Flex 固定壳层，不用 `position: fixed` 让顶栏脱离文档流。
  - 展开侧栏宽 `248px`，折叠宽 `72px`；主内容区水平内边距默认 `28px`，窄屏按现有断点收敛，内容最大宽度 `1600px`。
  - 菜单必须递归支持 `children` 子菜单：父节点负责展开/收起，叶子节点负责路由跳转；当前子路由自动展开并高亮父级，折叠侧栏时子菜单使用不被侧栏裁剪的弹层，禁止拍平菜单树。
  - 菜单只保留一个纵向滚动区域；可隐藏滚动条外观，但必须保留滚轮、触摸和键盘可达性，禁止用 `overflow: hidden` 直接裁掉超长菜单或子菜单。
  - 修改主壳后至少检查：多级菜单跳转、直接访问子路由、侧栏折叠弹层、顶部菜单溢出、超长菜单滚动、内容滚动时顶栏固定、主题切换、大屏模式退出、窄屏布局，并执行受影响包的验证脚本。
- 可见回复使用简体中文；代码、命令、字段名保持原文。
