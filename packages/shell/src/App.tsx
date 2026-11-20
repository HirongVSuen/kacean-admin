import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

/** 布局骨架由 LayoutProvider 承担（作为路由根组件），App 仅作为路由出口 */
export default defineComponent({
  name: 'App',
  setup: () => () => <RouterView />
})
