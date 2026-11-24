import { defineComponent, ref } from 'vue'
import { DataTable, PageContainer, SectionCard } from '@kacean/ui'
import { createProjectColumns } from '../config/projectColumns'
import { projectRows } from '../data/projects'

export default defineComponent({
  name: 'TemplateTableExamples',
  setup() {
    const selectedRowKeys = ref<Array<string | number>>([projectRows[1].id])
    const columns = createProjectColumns()
    const simpleColumns = createProjectColumns(false)

    return () => (
      <PageContainer
        title="基础表格"
        description="展示常规表格、边框与斑马纹、行选择等高频用法，数据全部来自本地 mock。"
      >
        <SectionCard title="常规表格" description="适合标准数据列表，组合项目编号、进度条、状态标签与操作列。">
          <DataTable rowKey="id" data={projectRows.slice(0, 5)} columns={simpleColumns} />
        </SectionCard>

        <SectionCard title="边框与斑马纹" description="通过 bordered 与 stripe 增强密集数据的行间辨识度。">
          <DataTable rowKey="id" data={projectRows.slice(5, 10)} columns={simpleColumns} bordered stripe />
        </SectionCard>

        <SectionCard
          title="可选择表格"
          description="受控维护选中行，适用于批量操作场景；当前仅展示选择交互，不执行实际业务操作。"
        >
          <p class="selection-summary">已选择 {selectedRowKeys.value.length} 个项目</p>
          <DataTable
            rowKey="id"
            data={projectRows.slice(10, 16)}
            columns={[{ colKey: 'row-select', type: 'multiple', width: 48 }, ...columns]}
            selectedRowKeys={selectedRowKeys.value}
            onSelectChange={(keys: Array<string | number>) => (selectedRowKeys.value = keys)}
            selectOnRowClick
          />
        </SectionCard>
      </PageContainer>
    )
  }
})
