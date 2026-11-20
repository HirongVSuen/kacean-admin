import { computed, defineComponent } from 'vue'
import { Button, Card, Space, Tag } from 'tdesign-vue-next'
import { PageHeader } from '@kacean/shared'
import { DEFAULT_PAGE_SIZE, isSuccessResponse } from '@kacean/common'
import type { ApiResponse } from '@kacean/types'

export default defineComponent({
  name: 'DashboardView',
  setup() {
    // 公共包链路自检：types → common → shared → shell
    const res: ApiResponse<string> = { code: 0, message: 'ok', data: 'types → common → shared → shell 全部打通' }
    const demoMessage = computed(() => (isSuccessResponse(res) ? res.data : res.message))

    return () => (
      <div>
        <PageHeader title="工作台">
          <Tag theme="primary" variant="light">
            TSX + TDesign + UnoCSS
          </Tag>
        </PageHeader>
        <Card title="基座自检" bordered>
          <p>默认分页大小：{DEFAULT_PAGE_SIZE}</p>
          <p>公共包链路自检：{demoMessage.value}</p>
          <Space>
            <Button theme="primary">TDesign 按钮</Button>
            <span class="px-3 py-1 rounded bg-success text-[var(--td-font-white-1)] text-sm">UnoCSS 原子类</span>
          </Space>
        </Card>
      </div>
    )
  }
})
