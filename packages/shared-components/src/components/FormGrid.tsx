import { defineComponent } from 'vue'
import type { CSSProperties, PropType } from 'vue'

/** 响应式表单栅格；跨列字段在 FormItem 上添加 kacean-form-grid__full。 */
export const FormGrid = defineComponent({
  name: 'KaceanFormGrid',
  props: {
    columns: {
      type: Number as PropType<1 | 2 | 3>,
      default: 2
    }
  },
  setup(props, { slots }) {
    return () => (
      <div class="kacean-form-grid" style={{ '--kacean-form-grid-columns': String(props.columns) } as CSSProperties}>
        {slots.default?.()}
      </div>
    )
  }
})
