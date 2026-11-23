import { defineComponent } from 'vue'
import { Tag } from 'tdesign-vue-next'
import DataDictManagement from '../views/DataDictManagement'

/** 数据字典管理独立开发壳，不依赖 shell。 */
export default defineComponent({
  name: 'DataDictManagementDevApp',
  setup() {
    return () => (
      <main class="data-dict-management-dev">
        <header class="data-dict-management-dev__header">
          <h1>
            数据字典管理
            <Tag class="ml-2" variant="light">
              独立开发
            </Tag>
          </h1>
          <p>字典列表本地过滤与分页；点击行内「字典值」在右侧 overlay 面板中管理该字典的字典值。</p>
        </header>
        <div class="data-dict-management-dev__content">
          <DataDictManagement />
        </div>
      </main>
    )
  }
})
