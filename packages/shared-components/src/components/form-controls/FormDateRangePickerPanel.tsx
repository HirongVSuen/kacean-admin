import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { DateRangePickerPanel } from 'tdesign-vue-next'
import type { DateRangePickerPanelProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormDateRangePickerPanelProps = DateRangePickerPanelProps &
  VModelProps<DateRangePickerPanelProps['modelValue']>

/** 独立日期范围面板：支持双面板联动，其余 DateRangePickerPanel 属性与 v-model 原样透传。 */
export const FormDateRangePickerPanel = defineComponent({
  name: 'KaceanFormDateRangePickerPanel',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <DateRangePickerPanel {...attrs} class={['kacean-date-panel', attrs.class]} />
  }
}) as unknown as DefineComponent<FormDateRangePickerPanelProps>
