import { defineComponent } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import { PrimaryTable } from 'tdesign-vue-next'
import type { PrimaryTableCol, TableRowData, TdPrimaryTableProps } from 'tdesign-vue-next'

export type DataTableProps = Omit<TdPrimaryTableProps, 'data' | 'columns'> & {
  data: TableRowData[]
  columns: PrimaryTableCol[]
}

/** 带横向滚动容器的项目表格，其余 TDesign PrimaryTable 属性原样透传。 */
export const DataTable = defineComponent({
  name: 'KaceanDataTable',
  inheritAttrs: false,
  props: {
    rowKey: { type: String, required: true },
    data: { type: Array as PropType<TableRowData[]>, required: true },
    columns: { type: Array as PropType<PrimaryTableCol[]>, required: true },
    selectedRowKeys: { type: Array as PropType<Array<string | number>>, default: undefined },
    hover: { type: Boolean, default: true }
  },
  emits: ['selectChange'],
  setup(props, { attrs, emit }) {
    return () => (
      <div class="kacean-data-table">
        <PrimaryTable
          {...attrs}
          rowKey={props.rowKey}
          data={props.data}
          columns={props.columns}
          selectedRowKeys={props.selectedRowKeys}
          hover={props.hover}
          onSelectChange={(keys: Array<string | number>) => emit('selectChange', keys)}
        />
      </div>
    )
  }
}) as unknown as DefineComponent<DataTableProps>
