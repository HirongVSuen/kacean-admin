import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { Upload } from 'tdesign-vue-next'
import type { UploadProps } from 'tdesign-vue-next'
import type { VModelProps } from './types'

export type FormUploadProps = UploadProps & VModelProps<UploadProps['modelValue']>

/** 文件上传：通过 multiple 支持单文件/多文件，请求方式由使用方配置。 */
export const FormUpload = defineComponent({
  name: 'KaceanFormUpload',
  inheritAttrs: false,
  setup(_props, { attrs }) {
    return () => <Upload {...attrs} class={['kacean-form-upload', attrs.class]} />
  }
}) as unknown as DefineComponent<FormUploadProps>
