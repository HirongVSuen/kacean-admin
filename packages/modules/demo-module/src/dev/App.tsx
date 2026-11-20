import { defineComponent } from 'vue'
import { Tag } from 'tdesign-vue-next'
import { manifest } from '../manifest'
import List from '../views/List'

/** 模块独立开发壳：不依赖 shell，直接渲染模块自身页面与菜单信息 */
export default defineComponent({
  name: 'DemoModuleDevApp',
  setup() {
    return () => (
      <main class="p-6">
        <h1 class="text-xl font-bold">{manifest.name} 独立开发</h1>
        <p class="text-secondary">
          模块菜单：{manifest.menus.map((item) => item.title).join('、')}
          <Tag class="ml-2" variant="light">
            dev:module
          </Tag>
        </p>
        <List />
      </main>
    )
  }
})
