import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { DateRangePicker } from 'tdesign-vue-next'
import type { DateRangePickerProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormDateRangePickerProps = DateRangePickerProps & VModelProps<DateRangePickerProps['modelValue']>

/** 日期范围选择框：默认可清空，其余 DateRangePicker 属性与 v-model 原样透传。 */
export const FormDateRangePicker = defineComponent({
  name: 'KaceanFormDateRangePicker',
  inheritAttrs: false,
  props: {
    clearable: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    return () => <DateRangePicker {...attrs} class={['kacean-form-control', attrs.class]} clearable={props.clearable} />
  }
}) as unknown as DefineComponent<FormDateRangePickerProps>
