import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import { Tree } from 'tdesign-vue-next'
import type { TdTreeProps, TreeNodeValue, TreeOptionData } from 'tdesign-vue-next'

export type AppTreeProps = Omit<TdTreeProps, 'data'> & {
  data: TreeOptionData[]
  'onUpdate:modelValue'?: (value: TreeNodeValue[]) => void
  'onUpdate:actived'?: (value: TreeNodeValue[]) => void
  'onUpdate:expanded'?: (value: TreeNodeValue[]) => void
}

/** 树形展示：默认开启 hover，其余 TDesign Tree 属性、事件与 v-model 原样透传。 */
export const AppTree = defineComponent({
  name: 'KaceanAppTree',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<TreeOptionData[]>, required: true },
    hover: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    return () => (
      <div class="kacean-tree">
        <Tree {...attrs} data={props.data} hover={props.hover} />
      </div>
    )
  }
}) as unknown as DefineComponent<AppTreeProps>
