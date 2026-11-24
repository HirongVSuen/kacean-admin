import { defineComponent, h } from 'vue'
import PageHeader from './PageHeader.vue'

/** 标准页面容器：统一页头、操作区与内容间距。 */
export const PageContainer = defineComponent({
  name: 'KaceanPageContainer',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => (
      <div class="kacean-page">
        {h(
          PageHeader,
          { title: props.title, description: props.description },
          slots.actions ? { default: slots.actions } : undefined
        )}
        <div class="kacean-page__content">{slots.default?.()}</div>
      </div>
    )
  }
})
