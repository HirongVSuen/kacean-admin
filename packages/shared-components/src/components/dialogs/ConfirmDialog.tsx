import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import type { ButtonProps, DialogProps } from 'tdesign-vue-next'
import { AppDialog } from './AppDialog'
import type { AppDialogProps } from './AppDialog'

export type ConfirmDialogProps = Omit<
  AppDialogProps,
  'header' | 'body' | 'confirmBtn' | 'cancelBtn'
> & {
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
}

/** 确认对话框：收敛标题、主题和确认/取消按钮，业务仍控制确认后的行为。 */
export const ConfirmDialog = defineComponent({
  name: 'KaceanConfirmDialog',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '确认操作' },
    content: { type: String, default: '' },
    theme: { type: String as PropType<DialogProps['theme']>, default: 'warning' },
    confirmText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    confirmLoading: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const confirmBtn: ButtonProps = {
        content: props.confirmText,
        theme: props.theme === 'danger' ? 'danger' : 'primary'
      }

      return (
        <AppDialog
          {...attrs}
          visible={props.visible}
          header={props.title}
          theme={props.theme}
          confirmBtn={confirmBtn}
          cancelBtn={props.cancelText}
          confirmLoading={props.confirmLoading}
          v-slots={{ default: () => slots.default?.() ?? props.content }}
        />
      )
    }
  }
}) as unknown as DefineComponent<ConfirmDialogProps>
