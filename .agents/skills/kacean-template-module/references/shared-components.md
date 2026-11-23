# 模板页共享组件参考

所有组件统一从 `@kacean/shared` 导入。公共包直接导出 TS/Vue 源码，由消费方 Vite 编译，不为公共包单独执行构建。

## 组件选择

| 组件                                                  | 职责                                  | 关键 props / slots                                                                                                                                                                |
| ----------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageContainer`                                       | 标准页面容器，内部复用 `PageHeader`   | `title`、`description`；`default`、`actions` slots                                                                                                                                |
| `SectionCard`                                         | 表单、详情或示例的内容分区            | 可选 `title`（缺省不渲染卡片头部）、可选 `description`；`default` slot                                                                                                            |
| `DataTable`                                           | 带横向滚动容器的 TDesign PrimaryTable | 必需的 `rowKey`、`data`、`columns`；支持 PrimaryTable props 与 `onSelectChange`                                                                                                   |
| `PaginationBar`                                       | 带窄屏溢出处理的分页工具条            | 必需的 `total`；支持 Pagination props，额外提供 `align="left" \| "right"`                                                                                                         |
| `PaginatedTable`                                      | 组合 DataTable 与 PaginationBar       | 当前页 `data`、`total`、`current`、`pageSize`；`onPageChange`、`onSelectChange`；`fillHeight` 开启表内滚动                                                                        |
| `DataTableTemplate`                                   | 固定高度的完整数据表格页面模板        | `title`、可选 `description`、受控分页参数；`actions`、`search` slots                                                                                                              |
| `AppTree`                                             | 树形数据展示（TDesign Tree 封装）     | 必需的 `data`；透传 Tree props 与 `v-model` / `v-model:actived` / `v-model:expanded`，默认 `hover`                                                                                |
| `FormGrid`                                            | 响应式表单栅格                        | `columns={1 \| 2 \| 3}`，默认 2；`default` slot                                                                                                                                   |
| `FormInput` / `FormTextarea`                          | 单行与多行文本输入                    | 透传 Input / Textarea props 与 `v-model`；`FormInput` 默认 `clearable`                                                                                                            |
| `FormSelect` / `FormDatePicker`                       | 选择与单个日期选择                    | 透传 Select / DatePicker props 与 `v-model`，默认 `clearable`                                                                                                                     |
| `FormDateRangePicker`                                 | 日期范围选择                          | 透传 DateRangePicker props 与 `v-model`，默认 `clearable`                                                                                                                         |
| `FormDatePickerPanel` / `FormDateRangePickerPanel`    | 独立日期 / 日期范围面板               | 透传对应 Panel props 与 `v-model`，支持面板联动、禁用日期等原有能力                                                                                                               |
| `FormCalendar`                                        | 完整日历板（月历 / 年历）             | 透传 Calendar props、事件与插槽；通过 `value`、`onCellClick` 管理选中日期                                                                                                         |
| `FormRadioGroup` / `FormCheckboxGroup` / `FormSwitch` | 选择类字段                            | 透传对应 TDesign props、`options` 与 `v-model`                                                                                                                                    |
| `FormUpload`                                          | 单文件与多文件上传                    | 透传 Upload props 与 `v-model`；`multiple` 控制多选，上传请求由使用方配置                                                                                                         |
| `FormActions`                                         | 表单底部操作区                        | `split`；`default`、`secondary` slots                                                                                                                                             |
| `StepFormLayout`                                      | 步骤条与步骤内容容器                  | `current`、`steps: TdStepItemProps[]`；`default` slot                                                                                                                             |
| `AppDialog`                                           | 标准对话框                            | 透传 Dialog props；`v-model:visible`，默认宽 560px、关闭销毁、点遮罩不关闭                                                                                                        |
| `ConfirmDialog`                                       | 确认对话框                            | `title`、`content`、`theme`、`confirmText`、`cancelText`、`confirmLoading`                                                                                                        |
| `AppDrawer`                                           | 标准抽屉（SidePanel overlay 适配器）  | `v-model:visible`、`v-model:collapsed`；默认宽 480px，`mask={false}` 无遮罩；复用 SidePanel slots 与关闭行为                                                                      |
| `DetailSummary`                                       | 详情页摘要指标                        | `items: DetailSummaryItem[]`                                                                                                                                                      |
| `DetailGrid`                                          | 详情页主内容与侧栏                    | `default`、`aside` slots                                                                                                                                                          |
| `SidePanel`                                           | 右侧详情面板（dock / overlay）        | `visible`、`collapsed`、`width`、`title`、`mode`、`mask`、`showClose`、`showCollapse`；`title`、`extra`、`default`、`footer`、`collapsed` slots；`close`、`update:collapsed` 事件 |
| `PageHeader`                                          | 独立页头，通常优先使用 PageContainer  | `title`、可选 `description`；默认插槽为右侧操作区                                                                                                                                 |

## 表格与分页

`DataTable` 的 `data` 是传入即展示的数据。`PaginatedTable` 是**受控组合组件**：`data` 只包含当前页，`total` 是总条数，调用方处理 `onPageChange(pageInfo)` 并更新 `current`、`pageSize`。本地场景自行切片，接口场景在事件中查询，不把请求逻辑塞进共享组件。需要让分页固定、仅表格内容滚动时，可为 `PaginatedTable` 传 `fillHeight`，此时父容器必须提供确定高度；组件会补齐表格包装的 `height: 100%` 高度链，由 TDesign 的 `.t-table__content` 承担横向与纵向滚动，底部分页不参与表格滚动。

`DataTableTemplate` 是完整的数据列表页模板，内部组合 `PageHeader`、`SectionCard` 与 `PaginatedTable`，并默认开启表内滚动。页面包含统一页头、上方查询条件区和下方列表区域，不包含卡片描述和表格工具栏。它只统一布局，不持有查询条件、不发送请求，也不自动切片：

- `title` 为必需页头标题，`description` 为可选描述，`actions` 插槽用于页头右侧操作区。
- 查询条件区与列表区域均为无标题卡片，不渲染 `t-card__header`。
- `search` 是上方查询条件区的可选插槽，筛选控件与查询、重置等操作均由使用方自行管理。
- 表格与分页参数和 `PaginatedTable` 一致；`data` 仍为当前页数据，使用方处理 `onPageChange` 与 `onSelectChange`。
- 排序通过列配置 `sorter: true` 与透传的受控 `sort` / `onSortChange` 实现，页面在事件回调中自行排序本地数据或重新请求，模板不内置排序逻辑；`/template-module/table-pagination` 演示项目名称、项目进度与更新时间的本地排序，排序后回到第一页。
- 模板自动管理表格高度，不接收 `height`、`maxHeight` 或 `fillHeight`。shell 已为主内容区提供高度并关闭该模板的 main 滚动；其他宿主需给模板父容器设置确定高度。

```tsx
const pageRows = computed(() => {
  const start = (current.value - 1) * pageSize.value
  return allRows.slice(start, start + pageSize.value)
})

const handlePageChange = (pageInfo: PageInfo) => {
  pageSize.value = pageInfo.pageSize
  current.value = pageInfo.current
}

// TSX render
;<SharedPaginatedTable
  rowKey="id"
  data={pageRows.value}
  columns={columns}
  total={allRows.length}
  current={current.value}
  pageSize={pageSize.value}
  pageSizeOptions={[5, 10, 20]}
  onPageChange={handlePageChange}
/>
```

完整数据表格页面可直接使用模板，并通过 `search` 插槽放入页面自行管理的查询条件：

```tsx
;<DataTableTemplate
  title="数据表格模板"
  description="组合查询条件、数据列表与底部分页。"
  rowKey="id"
  data={pageRows.value}
  columns={columns}
  total={allRows.length}
  current={current.value}
  pageSize={pageSize.value}
  onPageChange={handlePageChange}
  v-slots={{
    search: () => <ProjectSearch onSearch={handleSearch} />
  }}
/>
```

`ProjectSearch` 仅表示使用方自己的筛选组件，不属于共享组件 API。模板页 `/template-module/table-pagination` 提供完整静态交互示例，使用本地 mock 过滤和切片，始终向模板传入当前页数据；shell 的 `integration` 模式不加载该模板模块。

列定义使用 TDesign `PrimaryTableCol`。当前版本自定义单元格签名为 `cell: (_h, { row }) => ...`，先把 `row` 显式转换为本地记录类型，再读取字段。选择列的 `type: 'multiple'` 必要时使用 `as const` 保持字面量类型。

## 树

`AppTree` 是 TDesign `Tree` 的薄封装：必需 `data`（`TreeOptionData[]`，默认读取 `label` / `value` / `children` 字段，可用 `keys` 映射），默认 `hover`，其余 Tree props、事件以及自定义 `label` / `operations` 渲染原样透传。

- 勾选值使用 `v-model`（`valueMode` 控制 `onlyLeaf` / `parentFirst` / `all`），激活节点使用 `v-model:actived`，展开节点使用 `v-model:expanded`，三者相互独立，均可只传 `default*` 走非受控。
- 共享组件不内置搜索框、过滤请求或权限裁剪：关键字过滤由页面维护关键字并传 `filter`，异步加载由页面传 `load`，节点增删改由页面更新 `data`。

```tsx
const checked = ref<TreeNodeValue[]>([])
const actived = ref<TreeNodeValue[]>([])
const expanded = ref<TreeNodeValue[]>(['root'])

;<AppTree
  data={treeData}
  checkable
  activable
  expandOnClickNode
  v-model={checked.value}
  v-model:actived={actived.value}
  v-model:expanded={expanded.value}
/>
```

`TreeOptionData`、`TreeNodeValue`、`TreeNodeModel` 等类型直接从 `tdesign-vue-next` 导入。

## 表单与详情

- 跨整行的 FormItem 添加 `class="kacean-form-grid__full"`；窄屏下 FormGrid 自动变为单列。
- `Form*` 字段组件只包装控件，不替代 TDesign `FormItem`；`Form` 的 `data`、`rules` 和校验仍由页面管理。
- `FormInput`、`FormSelect`、`FormDatePicker`、`FormDateRangePicker` 默认 `clearable`，其他 TDesign props、事件与 `v-model` 原样透传。
- `FormDatePickerPanel`、`FormDateRangePickerPanel` 用于页面内直接选期；开始/结束联动通过页面传入 `disableDate` 实现，共享组件不内置业务日期规则。
- `FormCalendar` 是完整 Calendar 日历板，支持年月切换与日期单元格插槽；Calendar 原生不提供 `update:modelValue`，使用方通过 `value` 和 `onCellClick` 更新选中值。
- `FormUpload` 使用 `multiple` 开启多文件，`max`、`accept`、`sizeLimit` 等约束沿用 Upload；示例使用 `autoUpload={false}` 仅维护本地文件列表，真实上传由页面配置 `action` 或 `requestMethod`。
- `AppDialog`、`ConfirmDialog`、`AppDrawer` 使用 `v-model:visible` 控制显隐；确认按钮的校验、异步加载和关闭时机由页面控制。`AppDrawer` 是 `SidePanel` 的 overlay 适配器，支持 `title`、`width`、`collapsed`、`mask` 和相同插槽，不透传 TDesign Drawer 专有 props。
- `StepFormLayout` 只负责展示，不持有步骤状态；上一步、下一步、校验、重置和提交仍由页面控制。
- `FormActions` 默认右对齐；分步表单使用 `split`，通过 `secondary` 插槽放重置等左侧操作。
- `DetailSummaryItem` 支持 `label`、简单 `value`，或通过 `content: () => VNodeChild` 渲染 Tag、Progress 等内容。
- `DetailGrid` 的 `default` 是主区域，`aside` 是侧栏；窄屏自动变成单列。

```tsx
const visible = ref(false)

;<AppDialog v-model:visible={visible.value} header="编辑信息" onConfirm={save}>
  <FormInput v-model={formData.name} placeholder="请输入名称" />
</AppDialog>

;<ConfirmDialog
  v-model:visible={confirmVisible.value}
  title="确认删除？"
  content="此操作需要确认。"
  theme="danger"
  onConfirm={remove}
/>
```

命名插槽在 TSX 中使用 `v-slots`，例如：

```tsx
<PageContainer
  title="详情"
  v-slots={{
    actions: () => <Button theme="primary">编辑</Button>,
    default: () => <SectionCard title="基础信息">内容</SectionCard>
  }}
/>
```

## 右侧面板

- `SidePanel` 是受控组件：`visible` 控制显隐，`v-model:collapsed` 控制收缩；`showClose`、`showCollapse` 分别控制关闭与收缩按钮是否显示，默认均显示；`mode="dock"` 需放在 flex 行容器内（占位推挤，收缩为 40px 把手条），`mode="overlay"` 为 fixed 抽屉（滑入滑出过渡 + 遮罩淡入淡出），页面内降级优先用 overlay；`mask={false}` 时不渲染遮罩，面板外区域保持可交互；`closeOnEsc`、`closeOnOverlayClick` 可分别控制 Esc 与点遮罩关闭。dock 推挤布局的页面级演示见 template-module `DockPanel` 页（`/template-module/dock-panel`）：flex 行容器 + 主内容 `flex: 1; min-width: 0` + `SidePanel mode="dock"`。
- 壳层全局面板通过可选注入使用：`const panel = inject(PANEL_CONTROLLER_KEY, undefined)`（key 来自 `@kacean/common`，`PanelController` 类型在 `@kacean/types`）。有注入时 `panel.open({ title, component, props })`，无注入时用本地 `SidePanel` 渲染同一内容组件，不得假定注入一定存在。
- 全局面板宽度与收缩状态由壳层持久化，路由切换默认自动关闭（`closeOnRouteChange: false` 可覆盖）；参考 template-module `src/views/DetailLayout.tsx`。

## 新增公共组件检查

1. 名称和 API 使用通用业务语义，不包含 template-module 专属术语。
2. TDesign 包装组件若支持 attrs 透传，也必须暴露对应 TypeScript props 类型；运行时能传不代表 TSX 能通过。
3. 在 `packages/shared-components/src/index.ts` 导出组件及需要消费的类型。
4. 公共样式统一使用 `kacean-` 前缀，写入 `src/styles/index.css`，颜色只引用 `--td-*`。
5. 同步本参考和根文档，并执行所有消费方的类型检查与构建。
