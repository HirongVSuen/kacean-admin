import { computed, defineComponent, ref } from 'vue'
import { Tag } from 'tdesign-vue-next'
import type { TreeNodeModel, TreeNodeValue, TreeOptionData } from 'tdesign-vue-next'
import { AppTree, FormInput, PageContainer, SectionCard } from '@kacean/ui'
import { organizationTree, serviceCatalogChildren, serviceCatalogTree } from '../data/organization'

/** 收集节点 value 与 label 的映射，用于展示激活与勾选结果。 */
const collectLabels = (nodes: TreeOptionData[], map = new Map<string, string>()) => {
  nodes.forEach((node) => {
    map.set(String(node.value), String(node.label ?? node.value))
    if (Array.isArray(node.children)) collectLabels(node.children, map)
  })
  return map
}

export default defineComponent({
  name: 'TemplateTreeExamples',
  setup() {
    const labelMap = collectLabels(organizationTree)

    const actived = ref<TreeNodeValue[]>(['dept-product'])
    const expanded = ref<TreeNodeValue[]>(['platform', 'dept-product'])
    const activeLabel = computed(() => {
      const current = actived.value[0]
      return current === undefined ? '未选择' : (labelMap.get(String(current)) ?? String(current))
    })

    const keyword = ref('')
    // 每次关键字变化都生成新的过滤函数引用，确保树重新执行过滤。
    const organizationFilter = computed(() => {
      const value = keyword.value.trim()
      if (!value) return undefined
      return (node: TreeNodeModel<TreeOptionData>) => String(node.data.label ?? '').includes(value)
    })

    const checked = ref<TreeNodeValue[]>(['product-frontend', 'product-backend'])
    const checkedLabels = computed(() => checked.value.map((value) => labelMap.get(String(value)) ?? String(value)))

    /** 模拟异步加载子节点，仅返回本地静态数据，不发起真实请求。 */
    const loadCatalogChildren = (node: TreeNodeModel<TreeOptionData>) =>
      new Promise<TreeOptionData[]>((resolve) => {
        setTimeout(() => {
          resolve(serviceCatalogChildren[String(node.value)] ?? [])
        }, 600)
      })

    return () => (
      <PageContainer
        title="树形组件"
        description="演示 AppTree 的激活、过滤、勾选与懒加载；全部基于本地 mock，不发起真实请求。"
      >
        <SectionCard
          title="激活与受控展开"
          description="通过 v-model:actived 与 v-model:expanded 同步激活节点和展开状态，点击节点文字即可展开。"
        >
          <p class="selection-summary">当前激活：{activeLabel.value}</p>
          <AppTree
            data={organizationTree}
            activable
            expandOnClickNode
            v-model:actived={actived.value}
            v-model:expanded={expanded.value}
          />
        </SectionCard>

        <SectionCard
          title="关键字过滤"
          description="过滤条件由页面维护并通过 filter 透传；命中路径自动展开，清空关键字后恢复之前的展开状态。"
        >
          <div class="tree-filter">
            <FormInput v-model={keyword.value} placeholder="输入部门或团队名称，如：数据" />
          </div>
          <AppTree
            data={organizationTree}
            activable
            expandOnClickNode
            allowFoldNodeOnFilter
            filter={organizationFilter.value}
          />
        </SectionCard>

        <SectionCard
          title="勾选与取值"
          description="checkable 开启勾选，v-model 维护勾选值；valueMode=onlyLeaf 仅返回叶子节点，适合权限与范围选择。"
        >
          <p class="selection-summary">已勾选 {checked.value.length} 个叶子节点</p>
          <AppTree
            data={organizationTree}
            checkable
            expandOnClickNode
            defaultExpanded={['platform', 'dept-product']}
            valueMode="onlyLeaf"
            v-model={checked.value}
          />
          {checkedLabels.value.length > 0 && (
            <div class="tree-checked-values">
              {checkedLabels.value.map((label) => (
                <Tag key={label} variant="light">
                  {label}
                </Tag>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="懒加载"
          description="children 为 true 的节点首次展开时调用 load，示例用 600ms 延时模拟异步返回，不请求真实接口。"
        >
          <AppTree data={serviceCatalogTree} lazy load={loadCatalogChildren} activable />
        </SectionCard>
      </PageContainer>
    )
  }
})
