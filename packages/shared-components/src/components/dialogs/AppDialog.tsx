import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import { Dialog } from 'tdesign-vue-next'
import type { DialogProps } from 'tdesign-vue-next'
import type { VisibleModelProps } from './types'

export type AppDialogProps = DialogProps & VisibleModelProps

/** 标准对话框：统一默认宽度、遮罩点击和关闭销毁行为，支持 v-model:visible。 */
export const AppDialog = defineComponent({
  name: 'KaceanAppDialog',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    width: { type: [String, Number] as PropType<DialogProps['width']>, default: '560px' },
    destroyOnClose: { type: Boolean, default: true },
    closeOnOverlayClick: { type: Boolean, default: false }
  },
  setup(props, { attrs, slots }) {
    return () => (
      <Dialog
        {...attrs}
        dialogClassName={['kacean-app-dialog', attrs.dialogClassName].filter(Boolean).join(' ')}
        visible={props.visible}
        width={props.width}
        destroyOnClose={props.destroyOnClose}
        closeOnOverlayClick={props.closeOnOverlayClick}
        v-slots={slots}
      />
    )
  }
}) as unknown as DefineComponent<AppDialogProps>
