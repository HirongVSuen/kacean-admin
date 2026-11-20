import { defineComponent } from 'vue'
import { Card } from 'tdesign-vue-next'
import { PageHeader } from '@kacean/shared'

export default defineComponent({
  name: 'SettingsView',
  setup() {
    return () => (
      <div>
        <PageHeader title="系统设置" description="管理平台偏好与通用配置。" />
        <Card title="通用设置" bordered>
          <p class="m-0 text-secondary">配置能力将在后续版本中提供，当前页面用于展示统一的页面布局。</p>
        </Card>
      </div>
    )
  }
})
