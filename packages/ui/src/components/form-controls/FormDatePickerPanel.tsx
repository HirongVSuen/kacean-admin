import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { DatePickerPanel } from 'tdesign-vue-next'
import type { DatePickerPanelProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormDatePickerPanelProps = DatePickerPanelProps & VModelProps<DatePickerPanelProps['modelValue']>

/** 独立日期面板：适用于页面内直接选期，其余 DatePickerPanel 属性与 v-model 原样透传。 */
export const FormDatePickerPanel = defineComponent({
  name: 'KaceanFormDatePickerPanel',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <DatePickerPanel {...attrs} class={['kacean-date-panel', attrs.class]} />
  }
}) as unknown as DefineComponent<FormDatePickerPanelProps>
