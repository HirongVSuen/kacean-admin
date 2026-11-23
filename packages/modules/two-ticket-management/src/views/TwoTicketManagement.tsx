import { computed, defineComponent, ref } from 'vue'
import { Button, Tag } from 'tdesign-vue-next'
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { DataTableTemplate, FormInput, FormSelect } from '@kacean/shared'
import { ticketRows } from '../data/tickets'
import type { TicketRecord, TicketStatus, TicketType } from '../data/tickets'

const statusThemes: Record<TicketStatus, 'warning' | 'default' | 'primary' | 'success'> = {
  待签发: 'warning',
  待许可: 'default',
  执行中: 'primary',
  已终结: 'success'
}

const columns: PrimaryTableCol[] = [
  {
    title: '票据信息',
    colKey: 'title',
    minWidth: 270,
    cell: (_h, { row }) => {
      const ticket = row as TicketRecord
      return (
        <div class="two-ticket-management__ticket-cell">
          <strong>{ticket.title}</strong>
          <span>{ticket.id}</span>
        </div>
      )
    }
  },
  {
    title: '票据类型',
    colKey: 'type',
    width: 110,
    cell: (_h, { row }) => {
      const ticket = row as TicketRecord
      return (
        <Tag theme={ticket.type === '工作票' ? 'primary' : 'warning'} variant="light">
          {ticket.type}
        </Tag>
      )
    }
  },
  { title: '负责部门', colKey: 'department', minWidth: 140, ellipsis: true },
  { title: '负责人', colKey: 'owner', width: 100 },
  { title: '计划时间', colKey: 'planTime', width: 160 },
  {
    title: '流程状态',
    colKey: 'status',
    width: 100,
    cell: (_h, { row }) => {
      const ticket = row as TicketRecord
      return (
        <Tag theme={statusThemes[ticket.status]} variant="light">
          {ticket.status}
        </Tag>
      )
    }
  }
]

export default defineComponent({
  name: 'TwoTicketManagement',
  setup() {
    const current = ref(1)
    const pageSize = ref(5)
    const keyword = ref('')
    const type = ref<TicketType | ''>('')
    const status = ref<TicketStatus | ''>('')
    const appliedKeyword = ref('')
    const appliedType = ref<TicketType | ''>('')
    const appliedStatus = ref<TicketStatus | ''>('')
    const typeOptions = [
      { label: '全部票种', value: '' },
      { label: '工作票', value: '工作票' },
      { label: '操作票', value: '操作票' }
    ]
    const statusOptions = [
      { label: '全部状态', value: '' },
      { label: '待签发', value: '待签发' },
      { label: '待许可', value: '待许可' },
      { label: '执行中', value: '执行中' },
      { label: '已终结', value: '已终结' }
    ]

    const filteredRows = computed(() => {
      const normalizedKeyword = appliedKeyword.value.trim().toLowerCase()
      return ticketRows.filter((ticket) => {
        const matchesKeyword =
          !normalizedKeyword ||
          `${ticket.title} ${ticket.id} ${ticket.owner} ${ticket.department}`.toLowerCase().includes(normalizedKeyword)
        const matchesType = !appliedType.value || ticket.type === appliedType.value
        const matchesStatus = !appliedStatus.value || ticket.status === appliedStatus.value
        return matchesKeyword && matchesType && matchesStatus
      })
    })
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return filteredRows.value.slice(start, start + pageSize.value)
    })

    const applyFilters = () => {
      appliedKeyword.value = keyword.value
      appliedType.value = type.value
      appliedStatus.value = status.value
      current.value = 1
    }
    const resetFilters = () => {
      keyword.value = ''
      type.value = ''
      status.value = ''
      applyFilters()
    }
    const handlePageChange = (pageInfo: PageInfo) => {
      const maxPage = Math.max(1, Math.ceil(filteredRows.value.length / pageInfo.pageSize))
      pageSize.value = pageInfo.pageSize
      current.value = Math.min(pageInfo.current, maxPage)
    }

    return () => (
      <DataTableTemplate
        title="两票管理"
        rowKey="id"
        data={pageRows.value}
        columns={columns}
        total={filteredRows.value.length}
        current={current.value}
        pageSize={pageSize.value}
        pageSizeOptions={[5, 10, 20]}
        onPageChange={handlePageChange}
        v-slots={{
          search: () => (
            <div class="two-ticket-management__search">
              <FormInput
                v-model={keyword.value}
                placeholder="搜索票据名称、编号、负责人或部门"
                onEnter={applyFilters}
              />
              <FormSelect v-model={type.value} options={typeOptions} clearable={false} />
              <FormSelect v-model={status.value} options={statusOptions} clearable={false} />
              <div class="two-ticket-management__search-actions">
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
