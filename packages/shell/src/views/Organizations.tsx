import { defineComponent } from 'vue'
import { Card } from 'tdesign-vue-next'
import { PageHeader } from '@kacean/shared'

export default defineComponent({
  name: 'OrganizationsView',
  setup() {
    return () => (
      <div>
        <PageHeader title="组织管理" description="维护组织架构、成员归属与组织层级。" />
        <Card title="组织架构" bordered>
          <p class="m-0 text-secondary">组织管理能力将在后续版本中提供，当前页面用于展示系统管理分组的导航结构。</p>
        </Card>
      </div>
    )
  }
})
