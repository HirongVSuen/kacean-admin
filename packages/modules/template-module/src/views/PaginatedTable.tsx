import { computed, defineComponent, ref } from 'vue'
import { Tag } from 'tdesign-vue-next'
import type { PageInfo } from 'tdesign-vue-next'
import { PageContainer, PaginatedTable as SharedPaginatedTable, SectionCard } from '@kacean/shared'
import { createProjectColumns } from '../config/projectColumns'
import { projectRows } from '../data/projects'

export default defineComponent({
  name: 'TemplatePaginatedTable',
  setup() {
    const current = ref(1)
    const pageSize = ref(5)
    const selectedRowKeys = ref<Array<string | number>>([])
    const columns = [{ colKey: 'row-select', type: 'multiple', width: 48 } as const, ...createProjectColumns()]

    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return projectRows.slice(start, start + pageSize.value)
    })

    const handlePageChange = (pageInfo: PageInfo) => {
      const maxPage = Math.max(1, Math.ceil(projectRows.length / pageInfo.pageSize))
      pageSize.value = pageInfo.pageSize
      current.value = Math.min(pageInfo.current, maxPage)
    }

    return () => (
      <PageContainer
        title="分页表格"
        description="以项目列表为例，组合行选择、表格与完整分页；46 条本地数据可直接翻页和切换每页条数。"
      >
        <SectionCard title="项目列表" description="前端分页示例，不发送网络请求；实际业务可将分页事件替换为接口查询。">
          <div class="selection-summary">
            <Tag theme="primary" variant="light">
              本地数据
            </Tag>
            <span class="ml-2">
              共 {projectRows.length} 条，已选择 {selectedRowKeys.value.length} 条
            </span>
          </div>
          <SharedPaginatedTable
            rowKey="id"
            data={pageRows.value}
            columns={columns}
            total={projectRows.length}
            current={current.value}
            pageSize={pageSize.value}
            selectedRowKeys={selectedRowKeys.value}
            pageSizeOptions={[5, 10, 20]}
            onPageChange={handlePageChange}
            onSelectChange={(keys: Array<string | number>) => (selectedRowKeys.value = keys)}
            selectOnRowClick
          />
        </SectionCard>
      </PageContainer>
    )
  }
})
