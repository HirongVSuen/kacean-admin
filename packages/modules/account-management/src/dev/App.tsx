import { defineComponent } from 'vue'
import { Tag } from 'tdesign-vue-next'
import AccountManagement from '../views/AccountManagement'

/** 账号管理独立开发壳，不依赖 shell。 */
export default defineComponent({
  name: 'AccountManagementDevApp',
  setup() {
    return () => (
      <main class="account-management-dev">
        <header class="account-management-dev__header">
          <h1>
            账号管理
            <Tag class="ml-2" variant="light">
              独立开发
            </Tag>
          </h1>
          <p>账号管理使用真实后端接口，支持查询、新增、编辑与删除。</p>
        </header>
        <div class="account-management-dev__content">
          <AccountManagement />
        </div>
      </main>
    )
  }
})
