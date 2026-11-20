# kacean-admin

基于 pnpm monorepo 的后台管理系统：**shell 主壳 + 业务模块（modules）+ 公共包**。

## 环境要求

- Node.js >= 20
- pnpm 10.34.9（已由根 `package.json` 的 `packageManager` 锁定，推荐用 corepack 启用）

## 快速开始

```bash
pnpm install        # 根目录安装全部依赖
pnpm dev:shell      # 开发主壳应用
```

## 目录结构

```
packages/
├─ shell/              # 主壳应用
├─ admin-module-types/ # 共享 TypeScript 类型定义（包名 @kacean/types）
├─ common/             # 共享通用逻辑（工具函数、常量等）
├─ shared-components/  # 共享 UI 组件
└─ modules/            # 业务插件模块：每一个文件夹都是一个独立模块
   └─ <模块名>/         # 可独立开发、独立构建
```

- 主壳与公共包：`packages/` 下固定为 `shell`、`admin-module-types`、`common`、`shared-components`。
- 业务模块：只放 `packages/modules/` 下，模块间互不依赖，共享能力使用公共包（`workspace:*`）。

## 常用命令

| 命令                         | 说明         |
| ---------------------------- | ------------ |
| `pnpm dev:shell`             | 开发主壳     |
| `pnpm build:shell`           | 构建主壳     |
| `pnpm dev:module <模块名>`   | 开发指定模块 |
| `pnpm build:module <模块名>` | 构建指定模块 |
| `pnpm lint`                  | 全仓 lint    |
| `pnpm format`                | 全仓格式化   |

## 协作规范

人类与 AI agent 共用同一套规范，见 [AGENTS.md](./AGENTS.md)。
