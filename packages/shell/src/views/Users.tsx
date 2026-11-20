import { defineComponent } from 'vue'
import { Card } from 'tdesign-vue-next'
import { PageHeader } from '@kacean/shared'

export default defineComponent({
  name: 'UsersView',
  setup() {
    return () => (
      <div>
        <PageHeader title="用户管理" description="维护平台用户、账号状态与角色权限。" />
        <Card title="用户列表" bordered>
          <p class="m-0 text-secondary">用户管理能力将在后续版本中提供，当前页面用于展示系统管理分组的导航结构。</p>
        </Card>
      </div>
    )
  }
})
