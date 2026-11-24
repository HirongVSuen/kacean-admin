import { defineComponent, ref } from 'vue'
import { Button, Descriptions, MessagePlugin, Tag } from 'tdesign-vue-next'
import { PageContainer, SectionCard, SidePanel } from '@kacean/ui'

const project = {
  name: '园区能源管理二期',
  code: 'PRJ-2026-0012',
  owner: '林晓',
  department: '数字化产品部',
  startDate: '2026-03-01',
  endDate: '2026-08-31',
  status: '进行中'
}

/** Dock 面板模板：SidePanel 在 flex 行容器内占位推挤，主内容自动变窄，不遮盖其他区域。 */
export default defineComponent({
  name: 'TemplateDockPanel',
  setup() {
    // 默认展开，进入页面即可看到主内容被推挤的效果。
    const panelVisible = ref(true)
    const panelCollapsed = ref(false)

    return () => (
      <div class="dock-panel-example">
        <div class="dock-panel-example__main">
          <PageContainer
            title="Dock 面板"
            description="SidePanel 的 dock 形态：在 flex 行容器内占位推挤，主内容自动变窄，不遮盖其他区域。"
          >
            {{
              actions: () => (
                <Button variant="outline" onClick={() => (panelVisible.value = !panelVisible.value)}>
                  {panelVisible.value ? '关闭侧栏面板' : '打开侧栏面板'}
                </Button>
              ),
              default: () => (
                <>
                  <SectionCard title="布局说明">
                    <p class="detail-note">
                      页面根节点是 flex 行容器，主内容区使用 flex: 1 与 min-width: 0 自动让出宽度；右侧面板为普通 flex
                      子项，不使用 fixed 定位，因此不会遮盖主内容。
                    </p>
                    <p class="detail-note">
                      面板右上角可将面板收缩为 40px 把手条，点击把手重新展开；需要浮层抽屉而非推挤时， 改用 overlay
                      形态（见「弹框组件」与「详情布局」页），窄屏场景同样建议 overlay。
                    </p>
                  </SectionCard>

                  <SectionCard title="主内容区" description="打开或关闭右侧面板，观察本区域宽度变化。">
                    <div class="example-descriptions">
                      <Descriptions column={2} bordered>
                        <Descriptions.DescriptionsItem label="项目名称">{project.name}</Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="项目编号">{project.code}</Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="负责人">{project.owner}</Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="所属部门">
                          {project.department}
                        </Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="启动日期">
                          {project.startDate}
                        </Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="计划完成">
                          {project.endDate}
                        </Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="项目状态" span={2}>
                          <Tag theme="primary" variant="light">
                            {project.status}
                          </Tag>
                        </Descriptions.DescriptionsItem>
                      </Descriptions>
                    </div>
                  </SectionCard>
                </>
              )
            }}
          </PageContainer>
        </div>

        <SidePanel
          visible={panelVisible.value}
          v-model:collapsed={panelCollapsed.value}
          mode="dock"
          width={360}
          title="项目详情"
          onClose={() => (panelVisible.value = false)}
          v-slots={{
            default: () => (
              <>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.DescriptionsItem label="项目名称">{project.name}</Descriptions.DescriptionsItem>
                  <Descriptions.DescriptionsItem label="项目编号">{project.code}</Descriptions.DescriptionsItem>
                  <Descriptions.DescriptionsItem label="负责人">{project.owner}</Descriptions.DescriptionsItem>
                  <Descriptions.DescriptionsItem label="当前状态">{project.status}</Descriptions.DescriptionsItem>
                </Descriptions>
                <p class="detail-note" style="margin-top: 16px">
                  本面板与主内容共享同一 flex 行容器，面板内的操作不会遮挡主内容；所有按钮均为本地演示，不保存数据。
                </p>
              </>
            ),
            footer: () => (
              <>
                <Button variant="outline" onClick={() => (panelVisible.value = false)}>
                  关闭
                </Button>
                <Button theme="primary" onClick={() => MessagePlugin.info('模板示例：编辑项目')}>
                  编辑项目
                </Button>
              </>
            )
          }}
        />
      </div>
    )
  }
})
