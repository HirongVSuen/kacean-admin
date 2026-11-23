import { defineComponent, h, ref } from 'vue'
import type { Component } from 'vue'
import { Button, Tag } from 'tdesign-vue-next'
import { manifest } from '../manifest'
import DateExamples from '../views/DateExamples'
import DetailLayout from '../views/DetailLayout'
import DialogExamples from '../views/DialogExamples'
import DockPanel from '../views/DockPanel'
import PaginatedTable from '../views/PaginatedTable'
import PaginationExamples from '../views/PaginationExamples'
import SectionForm from '../views/SectionForm'
import StepForm from '../views/StepForm'
import TableExamples from '../views/TableExamples'
import TreeExamples from '../views/TreeExamples'

const pages: Array<{ path: string; title: string; component: Component }> = [
  { path: '/template-module/table', title: '基础表格', component: TableExamples },
  { path: '/template-module/pagination', title: '分页组件', component: PaginationExamples },
  { path: '/template-module/table-pagination', title: '分页表格', component: PaginatedTable },
  { path: '/template-module/step-form', title: '分步表单', component: StepForm },
  { path: '/template-module/section-form', title: '分块表单', component: SectionForm },
  { path: '/template-module/dates', title: '日期选择', component: DateExamples },
  { path: '/template-module/dialogs', title: '弹框组件', component: DialogExamples },
  { path: '/template-module/detail', title: '详情布局', component: DetailLayout },
  { path: '/template-module/tree', title: '树形组件', component: TreeExamples },
  { path: '/template-module/dock-panel', title: 'Dock 面板', component: DockPanel }
]

/** 模块独立开发壳：不依赖 shell，直接切换模块内的全部示例页面。 */
export default defineComponent({
  name: 'TemplateModuleDevApp',
  setup() {
    const activePath = ref(pages[0].path)

    return () => {
      const activePage = pages.find((page) => page.path === activePath.value) ?? pages[0]

      return (
        <main class="template-dev-shell">
          <header class="template-dev-header">
            <h1>
              {manifest.name} 独立开发
              <Tag class="ml-2" variant="light">
                dev:module
              </Tag>
            </h1>
            <p>常用后台页面静态模板，所有交互均基于本地数据。</p>
          </header>
          <nav class="template-dev-nav" aria-label="模板页面">
            {pages.map((page) => (
              <Button
                key={page.path}
                size="small"
                theme={page.path === activePath.value ? 'primary' : 'default'}
                variant={page.path === activePath.value ? 'base' : 'outline'}
                onClick={() => (activePath.value = page.path)}
              >
                {page.title}
              </Button>
            ))}
          </nav>
          <div class="template-dev-content">{h(activePage.component)}</div>
        </main>
      )
    }
  }
})
