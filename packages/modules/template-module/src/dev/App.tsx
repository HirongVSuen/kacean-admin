import { defineComponent, h, ref } from 'vue'
import type { Component } from 'vue'
import { Button, Tag } from 'tdesign-vue-next'
import { manifest } from '../manifest'
import { dashboardMenu, pageMenus } from '../menus'
import Dashboard from '../views/Dashboard'
import DateExamples from '../views/DateExamples'
import DetailLayout from '../views/DetailLayout'
import DialogExamples from '../views/DialogExamples'
import DockPanel from '../views/DockPanel'
import DataTableTemplate from '../views/DataTableTemplate'
import PaginationExamples from '../views/PaginationExamples'
import SectionForm from '../views/SectionForm'
import StepForm from '../views/StepForm'
import TableExamples from '../views/TableExamples'
import TreeExamples from '../views/TreeExamples'

const pageComponents: Record<string, Component> = {
  '/dashboard': Dashboard,
  '/template-module/table': TableExamples,
  '/template-module/pagination': PaginationExamples,
  '/template-module/table-pagination': DataTableTemplate,
  '/template-module/step-form': StepForm,
  '/template-module/section-form': SectionForm,
  '/template-module/dates': DateExamples,
  '/template-module/dialogs': DialogExamples,
  '/template-module/detail': DetailLayout,
  '/template-module/tree': TreeExamples,
  '/template-module/dock-panel': DockPanel
}

const pages: Array<{ path: string; title: string; component: Component }> = [dashboardMenu, ...pageMenus].map(
  (item) => ({
    path: item.path,
    title: item.title,
    component: pageComponents[item.path]
  })
)

/** 模块独立开发壳：不依赖 shell，直接切换模块内的全部示例页面。 */
export default defineComponent({
  name: 'TemplateModuleDevApp',
  setup() {
    const activePath = ref(pages[0].path)

    return () => {
      const activePage = pages.find((page) => page.path === activePath.value) ?? pages[0]
      const activePageProps =
        activePath.value === '/dashboard' ? { onNavigate: (path: string) => (activePath.value = path) } : undefined

      return (
        <main
          class={[
            'template-dev-shell',
            { 'template-dev-shell--fixed': activePath.value === '/template-module/table-pagination' }
          ]}
        >
          <header class="template-dev-header">
            <h1>
              {manifest.name} 独立开发
              <Tag class="ml-2" variant="light">
                dev:module
              </Tag>
            </h1>
            <p>常用后台页面模板，所有示例均使用本地静态 mock 数据。</p>
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
          <div class="template-dev-content">{h(activePage.component, activePageProps)}</div>
        </main>
      )
    }
  }
})
