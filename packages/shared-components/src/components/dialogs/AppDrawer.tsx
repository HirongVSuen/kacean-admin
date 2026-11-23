import { defineComponent } from 'vue'
import type { DefineComponent } from 'vue'
import { SidePanel } from '../SidePanel'
import type { SidePanelProps } from '../SidePanel'
import type { VisibleModelProps } from './types'

export type AppDrawerProps = Omit<SidePanelProps, 'mode' | 'title'> &
  VisibleModelProps & {
    title?: string
    /** AppDialog 风格的标题别名，优先级高于 title */
    header?: string
    /** 是否渲染 footer 插槽，默认 true */
    footer?: boolean
  }

/** 标准抽屉：复用 SidePanel 的 overlay 形态，与 dock 面板共享内容、插槽和关闭行为。 */
export const AppDrawer = defineComponent({
  name: 'KaceanAppDrawer',
  inheritAttrs: false,
  props: {
    visible: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false },
    width: { type: Number, default: 480 },
    title: { type: String, default: '' },
    header: { type: String, default: '' },
    footer: { type: Boolean, default: true },
    showCollapse: { type: Boolean, default: false },
    /** 是否显示遮罩；false 时为无遮罩抽屉，面板外区域保持可交互 */
    mask: { type: Boolean, default: true },
    closeOnEsc: { type: Boolean, default: true },
    closeOnOverlayClick: { type: Boolean, default: true }
  },
  emits: ['close', 'update:visible', 'update:collapsed'],
  setup(props, { slots, emit }) {
    const close = () => {
      emit('update:visible', false)
      emit('close')
    }

    return () => (
      <SidePanel
        visible={props.visible}
        collapsed={props.collapsed}
        width={props.width}
        title={props.header || props.title}
        mode="overlay"
        mask={props.mask}
        showCollapse={props.showCollapse}
        closeOnEsc={props.closeOnEsc}
        closeOnOverlayClick={props.closeOnOverlayClick}
        onClose={close}
        v-slots={{
          ...slots,
          footer: props.footer ? slots.footer : undefined
        }}
        {...{
          'onUpdate:collapsed': (value: boolean) => emit('update:collapsed', value)
        }}
      />
    )
  }
}) as unknown as DefineComponent<AppDrawerProps>
