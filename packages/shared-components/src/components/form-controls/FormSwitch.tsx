import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Switch } from 'tdesign-vue-next'
import type { SwitchProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormSwitchProps = SwitchProps & VModelProps<SwitchProps['modelValue']>

/** 开关：保留 Switch 的自定义值、加载状态与 v-model。 */
export const FormSwitch = defineComponent({
  name: 'KaceanFormSwitch',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <Switch {...attrs} />
  }
}) as unknown as DefineComponent<FormSwitchProps>
