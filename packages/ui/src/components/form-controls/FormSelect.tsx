import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Select } from 'tdesign-vue-next'
import type { SelectProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormSelectProps = SelectProps & VModelProps<SelectProps['modelValue']>

/** 选择框：默认可清空，其余 Select 属性与 v-model 原样透传。 */
export const FormSelect = defineComponent({
  name: 'KaceanFormSelect',
  inheritAttrs: false,
  props: {
    clearable: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    return () => <Select {...attrs} class={['kacean-form-control', attrs.class]} clearable={props.clearable} />
  }
}) as unknown as DefineComponent<FormSelectProps>
