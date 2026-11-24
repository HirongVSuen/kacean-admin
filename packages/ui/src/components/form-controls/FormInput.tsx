import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Input } from 'tdesign-vue-next'
import type { InputProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormInputProps = InputProps & VModelProps<InputProps['modelValue']>

/** 单行输入框：默认可清空，其余 Input 属性与 v-model 原样透传。 */
export const FormInput = defineComponent({
  name: 'KaceanFormInput',
  inheritAttrs: false,
  props: {
    clearable: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    return () => <Input {...attrs} class={['kacean-form-control', attrs.class]} clearable={props.clearable} />
  }
}) as unknown as DefineComponent<FormInputProps>
