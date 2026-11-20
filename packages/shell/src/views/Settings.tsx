import { defineComponent } from 'vue'
import { Card } from 'tdesign-vue-next'
import { PageHeader } from '@kacean/shared'

export default defineComponent({
  name: 'SettingsView',
  setup() {
    return () => (
      <div>
        <PageHeader title="系统设置" />
        <Card bordered>系统设置页面占位，后续由 shell 或业务模块补充。</Card>
      </div>
    )
  }
})
