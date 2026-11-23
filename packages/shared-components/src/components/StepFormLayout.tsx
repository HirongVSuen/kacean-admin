import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import { Steps } from 'tdesign-vue-next'
import type { TdStepItemProps } from 'tdesign-vue-next'

/** 分步表单骨架：只管理步骤展示和内容容器，步骤状态仍由页面控制。 */
export const StepFormLayout = defineComponent({
  name: 'KaceanStepFormLayout',
  props: {
    current: { type: Number, required: true },
    steps: { type: Array as PropType<TdStepItemProps[]>, required: true }
  },
  setup(props, { slots }) {
    return () => (
      <div class="kacean-step-form">
        <div class="kacean-step-form__steps">
          <Steps current={props.current} options={props.steps} readonly />
        </div>
        <div class="kacean-step-form__panel">{slots.default?.()}</div>
      </div>
    )
  }
})
