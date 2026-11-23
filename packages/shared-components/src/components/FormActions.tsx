import { defineComponent } from 'vue'

/** 表单操作区：默认右对齐，split 模式通过 secondary 插槽放置左侧操作。 */
export const FormActions = defineComponent({
  name: 'KaceanFormActions',
  props: {
    split: { type: Boolean, default: false }
  },
  setup(props, { slots }) {
    return () => (
      <div class={['kacean-form-actions', { 'kacean-form-actions--split': props.split }]}>
        {slots.secondary && <div class="kacean-form-actions__secondary">{slots.secondary()}</div>}
        <div class="kacean-form-actions__primary">{slots.default?.()}</div>
      </div>
    )
  }
})
