import { defineComponent, ref } from 'vue'
import type { PageInfo } from 'tdesign-vue-next'
import { PageContainer, PaginationBar, SectionCard } from '@kacean/shared'

export default defineComponent({
  name: 'TemplatePaginationExamples',
  setup() {
    const current = ref(3)
    const pageSize = ref(10)

    const handleChange = (pageInfo: PageInfo) => {
      current.value = pageInfo.current
      pageSize.value = pageInfo.pageSize
    }

    return () => (
      <PageContainer
        title="分页组件"
        description="覆盖默认、简洁、完整功能及不同组件状态，可独立使用，也可与表格组合。"
      >
        <SectionCard title="默认分页" description="展示页码、前后翻页与折叠页码，适合大多数列表页。">
          <PaginationBar total={128} defaultCurrent={5} pageSize={10} maxPageBtn={5} />
        </SectionCard>

        <SectionCard title="简洁分页" description="仅保留当前页与前后翻页，适合空间紧凑的卡片或移动端区域。">
          <PaginationBar theme="simple" total={86} defaultCurrent={2} pageSize={10} />
        </SectionCard>

        <SectionCard title="完整功能" description="受控演示页码和每页条数联动，包含总数、条数选项、首尾页与页码跳转。">
          <p class="pagination-result">
            当前第 {current.value} 页，每页 {pageSize.value} 条，共 286 条
          </p>
          <PaginationBar
            current={current.value}
            pageSize={pageSize.value}
            total={286}
            pageSizeOptions={[10, 20, 50]}
            showJumper
            showPageSize
            showFirstAndLastPageBtn
            onChange={handleChange}
          />
        </SectionCard>

        <SectionCard
          title="尺寸与禁用状态"
          description="small 尺寸适用于紧凑工具区；禁用状态用于数据加载或不可操作场景。"
        >
          <div class="pagination-stack">
            <div class="pagination-stack__row">
              <span class="pagination-stack__label">小尺寸</span>
              <PaginationBar size="small" total={96} defaultCurrent={2} pageSize={10} />
            </div>
            <div class="pagination-stack__row">
              <span class="pagination-stack__label">禁用状态</span>
              <PaginationBar size="small" total={96} current={2} pageSize={10} disabled />
            </div>
          </div>
        </SectionCard>
      </PageContainer>
    )
  }
})
