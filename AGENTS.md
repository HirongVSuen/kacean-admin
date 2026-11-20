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
│  ├─ shell/              # 主壳应用
│  ├─ admin-module-types/ # 共享 TypeScript 类型定义（纯类型，不含运行时代码）
│  ├─ common/             # 共享通用逻辑：工具函数、常量等（无 UI）
│  ├─ shared-components/  # 共享 UI 组件
│  └─ modules/
│     └─ <模块名>/         # 独立业务插件模块，每一个文件夹就是一个模块
├─ AGENTS.md              # 本文件
└─ pnpm-workspace.yaml
```

- `packages/` 下子包固定为 `shell`、`admin-module-types`、`common`、`shared-components`，新增同级子包需先确认。
- `packages/modules/` 下每一个文件夹都是**独立业务插件模块**：独立开发、独立构建，通过 `pnpm dev:module <模块名>` / `pnpm build:module <模块名>` 操作。
- 包名规则：公共包统一使用 `@kacean/*` scope——`@kacean/types`（目录 `admin-module-types`）、`@kacean/common`、`@kacean/shared`（目录 `shared-components`）；`shell` 与业务模块的包名与目录名一致。
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
- 公共包通过包名引入：`@kacean/types`、`@kacean/common`、`@kacean/shared`（根 `tsconfig.json` 已配置 paths 指向各包 `src`）。
- 依赖装到**实际使用它的包**：`pnpm --filter <包名> add <依赖>`。
- 根 `package.json` 只放工程化公共 devDependencies（lint、format 等），业务依赖禁止装根目录。
- 新增第三方依赖前先说明用途与体积影响，不擅自加装。
- 公共包（types / common / shared）以 TS/Vue **源码直接导出**（`exports` 指向 `src/index.ts`），由消费方的 Vite 统一编译，公共包自身不需要 `build`；`types` 为纯类型包。

## 5. 验证闭环（自主能力基础）

- 每个包必须提供标准脚本：`dev`、`build`；逐步补齐 `lint`、`typecheck`、`test`。
- 改动代码后，必须运行受影响包的 `build`（以及已配置的 `lint`/`typecheck`/`test`）验证，失败要修到通过或如实上报。
- 命令未配置时不许假装已验证，直接说明「未验证」。

## 6. 行为边界

- 先读后改：修改任何包前，先读该包的 `package.json` 与相关源码。
- 不擅自变更架构（如模块间通信方式、构建工具选型）；需要变更时先给方案再动手。
- 模块之间不直接互相依赖；共享能力下沉到 `types` / `common` / `shared-components`。
- 业务模块不反向依赖 `shell` 内部实现；模块与 shell 的集成契约待 shell 落地后在此补充。
- 可见回复使用简体中文；代码、命令、字段名保持原文。
