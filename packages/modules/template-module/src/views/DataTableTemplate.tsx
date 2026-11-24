import { computed, defineComponent, ref } from 'vue'
import { Button } from 'tdesign-vue-next'
import type { PageInfo, TableSort } from 'tdesign-vue-next'
import { DataTableTemplate, FormInput, FormSelect } from '@kacean/ui'
import { createProjectColumns } from '../config/projectColumns'
import { projectRows } from '../data/projects'
import type { ProjectRecord, ProjectStatus } from '../data/projects'

/** 仅数据表格模板开启部分字段排序，不影响其他使用项目列配置的示例页。 */
const sortableColKeys = ['name', 'progress', 'updatedAt']

export default defineComponent({
  name: 'TemplateDataTableTemplate',
  setup() {
    const current = ref(1)
    const pageSize = ref(20)
    const selectedRowKeys = ref<Array<string | number>>([])
    const keyword = ref('')
    const status = ref<ProjectStatus | ''>('')
    const appliedKeyword = ref('')
    const appliedStatus = ref<ProjectStatus | ''>('')
    const columns = [
      { colKey: 'row-select', type: 'multiple', width: 48 } as const,
      ...createProjectColumns().map((column) =>
        column.colKey && sortableColKeys.includes(column.colKey) ? { ...column, sorter: true } : column
      )
    ]
    const statusOptions = [
      { label: '全部状态', value: '' },
      { label: '进行中', value: '进行中' },
      { label: '已完成', value: '已完成' },
      { label: '待启动', value: '待启动' }
    ]

    const filteredRows = computed(() => {
      const normalizedKeyword = appliedKeyword.value.trim().toLowerCase()
      return projectRows.filter((project) => {
        const matchesKeyword =
          !normalizedKeyword ||
          `${project.name} ${project.id} ${project.owner}`.toLowerCase().includes(normalizedKeyword)
        const matchesStatus = !appliedStatus.value || project.status === appliedStatus.value
        return matchesKeyword && matchesStatus
      })
    })

    const totalRows = computed(() => filteredRows.value.length)
    const sort = ref<TableSort>()
    const sortedRows = computed(() => {
      const activeSort = sort.value
      if (!activeSort || Array.isArray(activeSort) || !activeSort.sortBy) return filteredRows.value
      const key = activeSort.sortBy as keyof ProjectRecord
      return [...filteredRows.value].sort((a, b) => {
        const aValue = a[key]
        const bValue = b[key]
        const result =
          typeof aValue === 'number' && typeof bValue === 'number'
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue), 'zh-CN')
        return activeSort.descending ? -result : result
      })
    })
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return sortedRows.value.slice(start, start + pageSize.value)
    })

    const applyFilters = () => {
      appliedKeyword.value = keyword.value
      appliedStatus.value = status.value
      current.value = 1
      selectedRowKeys.value = []
    }

    const resetFilters = () => {
      keyword.value = ''
      status.value = ''
      applyFilters()
    }

    const handlePageChange = (pageInfo: PageInfo) => {
      const maxPage = Math.max(1, Math.ceil(totalRows.value / pageInfo.pageSize))
      pageSize.value = pageInfo.pageSize
      current.value = Math.min(pageInfo.current, maxPage)
    }

    const handleSortChange = (nextSort: TableSort) => {
      sort.value = nextSort
      current.value = 1
      selectedRowKeys.value = []
    }

    return () => (
      <DataTableTemplate
        title="数据表格模板"
        description="组合查询条件、数据列表与底部分页，支持本地筛选、排序和行选择，仅表格内容区滚动。"
        rowKey="id"
        data={pageRows.value}
        columns={columns}
        total={totalRows.value}
        current={current.value}
        pageSize={pageSize.value}
        selectedRowKeys={selectedRowKeys.value}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        sort={sort.value}
        onSelectChange={(keys: Array<string | number>) => (selectedRowKeys.value = keys)}
        selectOnRowClick
        v-slots={{
          search: () => (
            <div class="data-table-template-demo__search">
              <FormInput v-model={keyword.value} placeholder="搜索项目名称、编号或负责人" onEnter={applyFilters} />
              <FormSelect v-model={status.value} options={statusOptions} clearable={false} />
              <div class="data-table-template-demo__search-actions">
                <Button theme="primary" onClick={applyFilters}>
                  查询
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  重置
                </Button>
              </div>
            </div>
          )
        }}
      />
    )
  }
})
