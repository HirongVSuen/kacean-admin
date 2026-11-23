import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Textarea } from 'tdesign-vue-next'
import type { TextareaProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormTextareaProps = TextareaProps & VModelProps<TextareaProps['modelValue']>

/** 多行输入框：统一块级宽度，其余 Textarea 属性与 v-model 原样透传。 */
export const FormTextarea = defineComponent({
  name: 'KaceanFormTextarea',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <Textarea {...attrs} class={['kacean-form-control', attrs.class]} />
  }
}) as unknown as DefineComponent<FormTextareaProps>
