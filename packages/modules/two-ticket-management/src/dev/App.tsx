import { defineComponent, ref } from 'vue'
import { Button, Tag } from 'tdesign-vue-next'
import TicketTypeManagement from '../views/TicketTypeManagement'
import TwoTicketManagement from '../views/TwoTicketManagement'

/** 两票管理独立开发壳，不依赖 shell。 */
export default defineComponent({
  name: 'TwoTicketManagementDevApp',
  setup() {
    const activePage = ref<'tickets' | 'types'>('tickets')

    return () => (
      <main class="two-ticket-management-dev">
        <header class="two-ticket-management-dev__header">
          <h1>
            两票管理
            <Tag class="ml-2" variant="light">
              独立开发
            </Tag>
          </h1>
          <p>
            {activePage.value === 'tickets'
              ? '两票列表使用本地静态数据，筛选与分页不发起网络请求。'
              : '两票类型管理使用真实后端接口，支持查询、新增、编辑与删除。'}
          </p>
          <nav class="two-ticket-management-dev__nav" aria-label="两票管理页面">
            <Button
              theme={activePage.value === 'tickets' ? 'primary' : 'default'}
              onClick={() => (activePage.value = 'tickets')}
            >
              两票列表
            </Button>
            <Button
              theme={activePage.value === 'types' ? 'primary' : 'default'}
              onClick={() => (activePage.value = 'types')}
            >
              两票类型管理
            </Button>
          </nav>
        </header>
        <div class="two-ticket-management-dev__content">
          {activePage.value === 'tickets' ? <TwoTicketManagement /> : <TicketTypeManagement />}
        </div>
      </main>
    )
  }
})
