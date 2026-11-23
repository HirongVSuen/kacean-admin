import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { CheckboxGroup } from 'tdesign-vue-next'
import type { CheckboxGroupProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormCheckboxGroupProps = CheckboxGroupProps & VModelProps<CheckboxGroupProps['modelValue']>

/** 复选组：保留 CheckboxGroup 的 options、自定义插槽与 v-model。 */
export const FormCheckboxGroup = defineComponent({
  name: 'KaceanFormCheckboxGroup',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <CheckboxGroup {...attrs} />
  }
}) as unknown as DefineComponent<FormCheckboxGroupProps>
