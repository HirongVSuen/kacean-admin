import { defineComponent } from 'vue'
import { Card } from 'tdesign-vue-next'

/** 内容分区卡片：用于表单分块、详情分组和组件示例。 */
export const SectionCard = defineComponent({
  name: 'KaceanSectionCard',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' }
  },
  setup(props, { slots }) {
    return () => (
      <Card class="kacean-section-card" title={props.title} bordered>
        {props.description && <p class="kacean-section-card__description">{props.description}</p>}
        {slots.default?.()}
      </Card>
    )
  }
})
