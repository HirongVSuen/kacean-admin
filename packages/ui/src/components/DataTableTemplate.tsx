import { defineComponent, h } from 'vue'
import type { DefineComponent, PropType } from 'vue'
import type { PageInfo, PrimaryTableCol, TableRowData, TdPaginationProps } from 'tdesign-vue-next'
import { PaginatedTable } from './PaginatedTable'
import type { PaginatedTableProps } from './PaginatedTable'
import { SectionCard } from './SectionCard'
import PageHeader from './PageHeader.vue'

export type DataTableTemplateProps = Omit<PaginatedTableProps, 'height' | 'maxHeight' | 'fillHeight'> & {
  title: string
  description?: string
}

/** 数据表格页面模板：统一页头、查询条件区与列表区域，仅表格内容区滚动。 */
export const DataTableTemplate = defineComponent({
  name: 'KaceanDataTableTemplate',
  inheritAttrs: false,
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
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
  setup(props, { attrs, slots, emit }) {
    return () => (
      <div class="kacean-page kacean-data-table-template">
        {h(
          PageHeader,
          { title: props.title, description: props.description },
          slots.actions ? { default: slots.actions } : undefined
        )}
        <div class="kacean-page__content">
          {slots.search && <SectionCard class="kacean-data-table-template__search">{slots.search()}</SectionCard>}
          <SectionCard class="kacean-data-table-template__card">
            <PaginatedTable
              {...attrs}
              rowKey={props.rowKey}
              data={props.data}
              columns={props.columns}
              total={props.total}
              current={props.current}
              pageSize={props.pageSize}
              selectedRowKeys={props.selectedRowKeys}
              pageSizeOptions={props.pageSizeOptions}
              showJumper={props.showJumper}
              showPageSize={props.showPageSize}
              fillHeight
              onPageChange={(pageInfo: PageInfo) => emit('pageChange', pageInfo)}
              onSelectChange={(keys: Array<string | number>) => emit('selectChange', keys)}
            />
          </SectionCard>
        </div>
      </div>
    )
  }
}) as unknown as DefineComponent<DataTableTemplateProps>
