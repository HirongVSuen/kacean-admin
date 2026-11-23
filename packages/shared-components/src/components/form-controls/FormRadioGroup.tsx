import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { RadioGroup } from 'tdesign-vue-next'
import type { RadioGroupProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormRadioGroupProps = RadioGroupProps & VModelProps<RadioGroupProps['modelValue']>

/** 单选组：保留 RadioGroup 的 options、自定义插槽与 v-model。 */
export const FormRadioGroup = defineComponent({
  name: 'KaceanFormRadioGroup',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <RadioGroup {...attrs} />
  }
}) as unknown as DefineComponent<FormRadioGroupProps>
