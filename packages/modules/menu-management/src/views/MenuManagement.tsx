import { computed, defineComponent, ref } from 'vue'
import { Button, Tag } from 'tdesign-vue-next'
import type { PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { DataTableTemplate, FormInput, FormSelect } from '@kacean/ui'
import { menuRows } from '../data/menus'
import type { MenuRecord, MenuType, MenuVisibility } from '../data/menus'

const typeThemes: Record<MenuType, 'default' | 'primary' | 'warning'> = {
  目录: 'default',
  菜单: 'primary',
  按钮: 'warning'
}

const columns: PrimaryTableCol[] = [
  {
    title: '菜单名称',
    colKey: 'title',
    minWidth: 170,
    cell: (_h, { row }) => {
      const menu = row as MenuRecord
      return (
        <div class="menu-management__name-cell">
          <strong>{menu.title}</strong>
          <span>{menu.id}</span>
        </div>
      )
    }
  },
  { title: '上级菜单', colKey: 'parentTitle', width: 120 },
  {
    title: '类型',
    colKey: 'type',
    width: 90,
    cell: (_h, { row }) => {
      const menu = row as MenuRecord
      return (
        <Tag theme={typeThemes[menu.type]} variant="light">
          {menu.type}
        </Tag>
      )
    }
  },
  { title: '路由路径', colKey: 'path', minWidth: 210, ellipsis: true },
  { title: '权限标识', colKey: 'permission', minWidth: 240, ellipsis: true },
  { title: '排序', colKey: 'order', width: 80 },
  {
    title: '可见性',
    colKey: 'visibility',
    width: 90,
    cell: (_h, { row }) => {
      const menu = row as MenuRecord
      return (
        <Tag theme={menu.visibility === '显示' ? 'success' : 'default'} variant="light">
          {menu.visibility}
        </Tag>
      )
    }
  }
]

export default defineComponent({
  name: 'MenuManagement',
  setup() {
    const current = ref(1)
    const pageSize = ref(5)
    const keyword = ref('')
    const type = ref<MenuType | ''>('')
    const visibility = ref<MenuVisibility | ''>('')
    const appliedKeyword = ref('')
    const appliedType = ref<MenuType | ''>('')
    const appliedVisibility = ref<MenuVisibility | ''>('')
    const typeOptions = [
      { label: '全部类型', value: '' },
      { label: '目录', value: '目录' },
      { label: '菜单', value: '菜单' },
      { label: '按钮', value: '按钮' }
    ]
    const visibilityOptions = [
      { label: '全部可见性', value: '' },
      { label: '显示', value: '显示' },
      { label: '隐藏', value: '隐藏' }
    ]

    const filteredRows = computed(() => {
      const normalizedKeyword = appliedKeyword.value.trim().toLowerCase()
      return menuRows.filter((menu) => {
        const matchesKeyword =
          !normalizedKeyword ||
          `${menu.title} ${menu.id} ${menu.path} ${menu.permission}`.toLowerCase().includes(normalizedKeyword)
        const matchesType = !appliedType.value || menu.type === appliedType.value
        const matchesVisibility = !appliedVisibility.value || menu.visibility === appliedVisibility.value
        return matchesKeyword && matchesType && matchesVisibility
      })
    })
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return filteredRows.value.slice(start, start + pageSize.value)
    })

    const applyFilters = () => {
      appliedKeyword.value = keyword.value
      appliedType.value = type.value
      appliedVisibility.value = visibility.value
      current.value = 1
    }
    const resetFilters = () => {
      keyword.value = ''
      type.value = ''
      visibility.value = ''
      applyFilters()
    }
    const handlePageChange = (pageInfo: PageInfo) => {
      const maxPage = Math.max(1, Math.ceil(filteredRows.value.length / pageInfo.pageSize))
      pageSize.value = pageInfo.pageSize
      current.value = Math.min(pageInfo.current, maxPage)
    }

    return () => (
      <DataTableTemplate
        title="菜单管理"
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
            <div class="menu-management__search">
              <FormInput v-model={keyword.value} placeholder="搜索菜单、路径或权限标识" onEnter={applyFilters} />
              <FormSelect v-model={type.value} options={typeOptions} clearable={false} />
              <FormSelect v-model={visibility.value} options={visibilityOptions} clearable={false} />
              <div class="menu-management__search-actions">
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
