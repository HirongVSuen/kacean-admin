---
name: kacean-template-module
description: 在 kacean-admin 中基于 @kacean/shared 新增或修改 template-module 的表格、分页、表单、详情模板页，或维护这些页面依赖的共享组件时使用。提供组件选择、模块注册、样式约束、TSX 用法和验证闭环。
---

# kacean-template-module

## 开始前

1. 阅读仓库根目录 `AGENTS.md`，以及 `packages/shared-components/package.json`、`packages/modules/template-module/package.json`。
2. 阅读本 Skill 的 `references/shared-components.md`，以当前源码和该参考中的组件契约为准；二者不一致时先核实源码并同步文档，不凭记忆补 API。
3. 修改已有页面前先读对应视图、列配置和 mock 数据，并查看 `git status --short` 与目标文件相关 diff，保留用户及并行任务的改动。
4. 确定最小影响范围与验证命令；工作区已有失败或本次涉及共享组件时，先运行必要的最小检查作为基线。

## 组件边界

- 模板页的页面骨架和已覆盖的组合模式必须优先使用 `@kacean/shared`，通过包名导入，禁止跨包相对路径引用源码。
- `PrimaryTable`、`Pagination` 不直接在模板页使用，分别采用 `DataTable`、`PaginationBar`；表格与分页组合采用 `PaginatedTable`，完整数据列表页采用 `DataTableTemplate`。
- 树形数据展示统一使用 `AppTree`，不直接在模板页使用 TDesign `Tree`；关键字过滤、懒加载请求和节点业务操作由页面管理。
- 页面容器、内容卡片、表单栅格、表单操作区、分步骨架和详情布局不得重新在模块内实现同名替代品。
- 单行/多行输入、选择、日期/日期范围、日期面板、完整日历板、单选、复选、开关和文件上传统一使用 `@kacean/shared` 的 `Form*` 字段组件；`Button`、`Tag`、`Alert` 等未封装原子组件直接使用 TDesign。
- 字段组件只统一控件行为并透传 TDesign props，不替代 `FormItem`，不内置校验、提交或上传请求；`Form`、规则和 `action` / `requestMethod` 仍由页面管理。
- 标准对话框、确认对话框和抽屉使用 `AppDialog`、`ConfirmDialog`、`AppDrawer`；`AppDrawer` 复用 `SidePanel` 的 overlay 形态，可见性与确认后的业务行为由页面控制。
- 共享组件不得出现具体模块名、`Example`、项目字段或 mock 数据；示例语义只留在 `template-module`。
- 新组件只有在职责通用、交互稳定且能被两个以上页面模式复用时可下沉；先说明 API，不在共享层提前实现筛选、请求、权限等未确定能力。

## 新增模板页流程

1. 根据 `references/shared-components.md` 选择组件，确定哪些内容是字段配置、列配置或本地数据。
2. 在 `packages/modules/template-module/src/views/` 新增懒加载页面；通用列配置放 `src/config/`，静态数据放 `src/data/`。
3. 模板页始终使用本地 mock，不新增后端请求，不把静态交互描述为真实保存或提交；真实接口联调应放在业务模块中，不在 `template-module` 增加数据源或 `integration` 分支。
4. 静态菜单、顶层 `group` 与菜单权限统一在 `src/menus.ts` 维护，不写入 shell；在 `src/manifest.ts` 引用菜单并同源维护 `routes`：叶子菜单必须有对应路由，使用 `() => import(...)` 懒加载，新增权限码必须在 `permissions` 申报。
5. 在 `src/dev/App.tsx` 登记独立开发入口，保证 `pnpm dev:module template-module` 可以直接访问新页面。
6. 新增页面不需要修改 shell；只有新增整个模块时才登记 shell 的 `src/modules.ts` 与 `src/modules.config.json`，并在 `packages/shell/package.json` 以 `workspace:*` 声明模块依赖。
7. 新增或变更公共组件时，必须同步更新 `packages/shared-components/src/index.ts` 与本 Skill 的参考文档；组件清单、公共契约或组件边界变化时，再同步根 `README.md` 与 `AGENTS.md`。
8. 样式只使用 TDesign token 和项目允许的语义原子类；公共布局样式放 shared-components，示例专属样式留在模块内。

## 数据表格模板与静态加载规则

内置完整用例为 `src/views/DataTableTemplate.tsx`，路由 `/template-module/table-pagination`，菜单标题「数据表格模板」。它演示查询条件区、列表区域、表内滚动、固定分页、部分字段本地排序、行选择与空数据布局，公共骨架来自 `@kacean/shared` 的 `DataTableTemplate`。

- 页面始终使用 `src/data/projects.ts` 本地过滤与切片，不发分页请求，不读取 `VITE_TEMPLATE_DATA_SOURCE`，不包含 `src/api/` 联调实现。
- shell 在默认 / static 模式导入并注册模板模块；`integration` 模式不导入、不注册，不显示模板菜单和路由。模板模块自身不需要判断当前模式。
- `template-module` 不提供 `dev:integration` / `build:integration`；`pnpm dev:shell:integration` 与 `pnpm build:integration` 用于排除模板模块后的真实业务主壳。

```bash
pnpm build:static
pnpm build:integration
```

根命令递归执行所有已配置对应脚本的包；当前 static 覆盖 template-module 双产物与 shell 应用，integration 仅覆盖 shell。两种构建都写入各自包的 `dist`，后执行的构建会覆盖同包前一次产物。

## 验证闭环

先按影响范围做最小检查，再执行统一静态检查，不得把未执行的检查描述为已通过：

```bash
pnpm check
pnpm exec prettier --check <本次变更文件...>
pnpm build:module template-module
pnpm build:shell
```

- `pnpm check` 已包含工作区约束、全仓 lint 与所有已配置的 `typecheck`；各包另有 `test` 时必须按影响范围执行。
- 修改共享组件时用 `pnpm build` 替代最后两条构建命令，以覆盖全部消费方；新增模块还需检查 shell 的依赖声明与模块清单。
- 全仓 `pnpm format:check` 可额外运行；若仅因无关既有文件失败，保留本次文件的定向检查结果并如实上报，不批量格式化无关文件。
- 按页面能力检查 mock 交互、分页边界、表单校验、明暗主题和窄屏布局；构建与类型检查不能替代浏览器走查，未执行时明确说明「浏览器交互未验证」。
