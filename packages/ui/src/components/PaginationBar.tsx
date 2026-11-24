import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import { Pagination } from 'tdesign-vue-next'
import type { PageInfo, TdPaginationProps } from 'tdesign-vue-next'

export type PaginationBarProps = Omit<TdPaginationProps, 'total'> & {
  total: number
  align?: 'left' | 'right'
}

/** 分页工具条：统一溢出行为，其余 TDesign Pagination 属性原样透传。 */
export const PaginationBar = defineComponent({
  name: 'KaceanPaginationBar',
  inheritAttrs: false,
  props: {
    total: { type: Number, required: true },
    current: { type: Number, default: undefined },
    pageSize: { type: Number, default: 10 },
    pageSizeOptions: {
      type: Array as PropType<TdPaginationProps['pageSizeOptions']>,
      default: undefined
    },
    align: {
      type: String as PropType<'left' | 'right'>,
      default: 'left'
    }
  },
  emits: ['change'],
  setup(props, { attrs, emit }) {
    return () => (
      <div class={['kacean-pagination-bar', `kacean-pagination-bar--${props.align}`]}>
        <Pagination
          {...attrs}
          total={props.total}
          current={props.current}
          pageSize={props.pageSize}
          pageSizeOptions={props.pageSizeOptions}
          onChange={(pageInfo: PageInfo) => emit('change', pageInfo)}
        />
      </div>
    )
  }
}) as unknown as DefineComponent<PaginationBarProps>
