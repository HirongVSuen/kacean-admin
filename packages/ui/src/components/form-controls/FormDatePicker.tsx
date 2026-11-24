import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { DatePicker } from 'tdesign-vue-next'
import type { DatePickerProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormDatePickerProps = DatePickerProps & VModelProps<DatePickerProps['modelValue']>

/** 日期选择框：默认可清空，其余 DatePicker 属性与 v-model 原样透传。 */
export const FormDatePicker = defineComponent({
  name: 'KaceanFormDatePicker',
  inheritAttrs: false,
  props: {
    clearable: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    return () => <DatePicker {...attrs} class={['kacean-form-control', attrs.class]} clearable={props.clearable} />
  }
}) as unknown as DefineComponent<FormDatePickerProps>
