import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import type { PageInfo, PrimaryTableCol, TableRowData, TdPaginationProps, TdPrimaryTableProps } from 'tdesign-vue-next'
import { DataTable } from './DataTable'
import { PaginationBar } from './PaginationBar'

export type PaginatedTableProps = Omit<TdPrimaryTableProps, 'data' | 'columns' | 'pagination' | 'onPageChange'> & {
  data: TableRowData[]
  columns: PrimaryTableCol[]
  total: number
  current: number
  pageSize: number
  pageSizeOptions?: TdPaginationProps['pageSizeOptions']
  showJumper?: boolean
  showPageSize?: boolean
  onPageChange?: (pageInfo: PageInfo) => void
}

/** 受控分页表格：data 为当前页数据，由调用方决定本地切片或远程查询。 */
export const PaginatedTable = defineComponent({
  name: 'KaceanPaginatedTable',
  inheritAttrs: false,
  props: {
    rowKey: { type: String, required: true },
    data: { type: Array as PropType<TableRowData[]>, required: true },
    columns: { type: Array as PropType<PrimaryTableCol[]>, required: true },
    total: { type: Number, required: true },
    current: { type: Number, required: true },
    pageSize: { type: Number, required: true },
    selectedRowKeys: { type: Array as PropType<Array<string | number>>, default: undefined },
    pageSizeOptions: {
      type: Array as PropType<TdPaginationProps['pageSizeOptions']>,
      default: () => [10, 20, 50]
    },
    showJumper: { type: Boolean, default: true },
    showPageSize: { type: Boolean, default: true }
  },
  emits: ['pageChange', 'selectChange'],
  setup(props, { attrs, emit }) {
    return () => (
      <div class="kacean-paginated-table">
        <DataTable
          {...attrs}
          rowKey={props.rowKey}
          data={props.data}
          columns={props.columns}
          selectedRowKeys={props.selectedRowKeys}
          onSelectChange={(keys: Array<string | number>) => emit('selectChange', keys)}
        />
        <PaginationBar
          align="right"
          total={props.total}
          current={props.current}
          pageSize={props.pageSize}
          pageSizeOptions={props.pageSizeOptions}
          showJumper={props.showJumper}
          showPageSize={props.showPageSize}
          onChange={(pageInfo: PageInfo) => emit('pageChange', pageInfo)}
        />
      </div>
    )
  }
}) as unknown as DefineComponent<PaginatedTableProps>
