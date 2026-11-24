import { defineComponent } from 'vue'
import type { PropType, VNodeChild } from 'vue'

export interface DetailSummaryItem {
  key?: string
  label: string
  value?: string | number
  content?: () => VNodeChild
}

/** 详情摘要指标，支持文本值或自定义标签、进度条等内容。 */
export const DetailSummary = defineComponent({
  name: 'KaceanDetailSummary',
  props: {
    items: { type: Array as PropType<DetailSummaryItem[]>, required: true }
  },
  setup(props) {
    return () => (
      <div class="kacean-detail-summary">
        {props.items.map((item) => (
          <div class="kacean-detail-summary__item" key={item.key ?? item.label}>
            <span class="kacean-detail-summary__label">{item.label}</span>
            <div class="kacean-detail-summary__value">{item.content ? item.content() : item.value}</div>
          </div>
        ))}
      </div>
    )
  }
})
