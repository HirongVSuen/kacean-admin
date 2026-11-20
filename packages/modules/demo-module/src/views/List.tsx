import { defineComponent, ref } from 'vue'
import { Button, Card, Space, Tag } from 'tdesign-vue-next'

export default defineComponent({
  name: 'DemoModuleList',
  setup() {
    const count = ref(0)

    return () => (
      <Card title="示例模块 · 列表页" bordered>
        <p class="mt-0 text-secondary">该页面由 demo-module 提供，菜单与路由均来自模块自身 manifest。</p>
        <Space>
          <Button theme="primary" onClick={() => count.value++}>
            点击计数：{count.value}
          </Button>
          <Tag theme="success" variant="light">
            ESM + UMD 双产物
          </Tag>
        </Space>
      </Card>
    )
  }
})
