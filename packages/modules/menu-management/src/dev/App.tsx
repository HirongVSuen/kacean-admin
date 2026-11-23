import { defineComponent } from 'vue'
import { Tag } from 'tdesign-vue-next'
import MenuManagement from '../views/MenuManagement'

/** 菜单管理独立开发壳，不依赖 shell。 */
export default defineComponent({
  name: 'MenuManagementDevApp',
  setup() {
    return () => (
      <main class="menu-management-dev">
        <header class="menu-management-dev__header">
          <h1>
            菜单管理
            <Tag class="ml-2" variant="light">
              独立开发
            </Tag>
          </h1>
          <p>当前使用本地静态数据，筛选与分页不发起网络请求。</p>
        </header>
        <div class="menu-management-dev__content">
          <MenuManagement />
        </div>
      </main>
    )
  }
})
