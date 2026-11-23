import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Calendar } from 'tdesign-vue-next'
import type { CalendarProps } from 'tdesign-vue-next'

export type FormCalendarProps = CalendarProps

/** 完整日历板：透传 Calendar props、事件与插槽，选中值由使用方通过 value 和 onCellClick 管理。 */
export const FormCalendar = defineComponent({
  name: 'KaceanFormCalendar',
  inheritAttrs: false,
  setup(_props, { attrs, slots }) {
    return () => <Calendar {...attrs} class={['kacean-calendar', attrs.class]} v-slots={slots} />
  }
}) as unknown as DefineComponent<FormCalendarProps>
