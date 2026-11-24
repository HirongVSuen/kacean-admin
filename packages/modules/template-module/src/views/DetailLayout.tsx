import { defineComponent, inject, ref } from 'vue'
import { Button, Descriptions, MessagePlugin, Progress, Space, Tag, Timeline } from 'tdesign-vue-next'
import { PANEL_CONTROLLER_KEY } from '@kacean/ui'
import type { DetailSummaryItem } from '@kacean/ui'
import { DetailGrid, DetailSummary, PageContainer, SectionCard, SidePanel } from '@kacean/ui'

const project = {
  name: '园区能源管理二期',
  code: 'PRJ-2026-0012',
  owner: '林晓',
  department: '数字化产品部',
  startDate: '2026-03-01',
  endDate: '2026-08-31',
  status: '进行中',
  progress: 68
}

const summaryItems: DetailSummaryItem[] = [
  {
    label: '当前状态',
    content: () => (
      <Tag theme="primary" variant="light">
        {project.status}
      </Tag>
    )
  },
  { label: '整体进度', content: () => <Progress percentage={project.progress} size="small" /> },
  { label: '项目负责人', value: project.owner },
  { label: '计划周期', value: '6 个月' }
]

/** 面板演示内容：壳层全局面板与页面内本地面板共用同一组件。 */
const ProjectPanelContent = defineComponent({
  name: 'ProjectPanelContent',
  props: { projectCode: { type: String, required: true } },
  setup(props) {
    return () => (
      <>
        <Descriptions column={1} bordered size="small">
          <Descriptions.DescriptionsItem label="项目名称">{project.name}</Descriptions.DescriptionsItem>
          <Descriptions.DescriptionsItem label="项目编号">{props.projectCode}</Descriptions.DescriptionsItem>
          <Descriptions.DescriptionsItem label="负责人">{project.owner}</Descriptions.DescriptionsItem>
          <Descriptions.DescriptionsItem label="当前状态">{project.status}</Descriptions.DescriptionsItem>
        </Descriptions>
        <p class="text-secondary" style="margin: 16px 0 0; font-size: 12px; line-height: 1.8">
          本面板由共享组件 SidePanel 渲染：独立平台下通过 PANEL_CONTROLLER_KEY 打开壳层全局面板（dock
          推挤内容区，可收缩为把手条，窄屏自动变为抽屉）；未注入面板控制器的宿主中， 同一内容降级为页面内 overlay 面板。
        </p>
      </>
    )
  }
})

export default defineComponent({
  name: 'TemplateDetailLayout',
  setup() {
    // 可选注入：shell 与单模块开发模式均提供；无头宿主可能未提供，需本地降级。
    const panel = inject(PANEL_CONTROLLER_KEY, undefined)
    const localPanelVisible = ref(false)
    const localPanelCollapsed = ref(false)

    const openSidePanel = () => {
      if (panel) {
        panel.open({
          title: '项目详情',
          width: 420,
          component: ProjectPanelContent,
          props: { projectCode: project.code }
        })
      } else {
        localPanelVisible.value = true
      }
    }

    return () => (
      <PageContainer
        title="详情布局"
        description="通过摘要、描述列表、主侧栏和时间线组织只读信息，适合项目、订单或审批详情。"
      >
        {{
          actions: () => (
            <Space>
              <Button variant="outline" onClick={openSidePanel}>
                侧栏详情
              </Button>
              <Button variant="outline" onClick={() => MessagePlugin.info('模板示例：返回列表')}>
                返回列表
              </Button>
              <Button theme="primary" onClick={() => MessagePlugin.info('模板示例：编辑项目')}>
                编辑项目
              </Button>
            </Space>
          ),
          default: () => (
            <>
              <SectionCard title="项目概览">
                <DetailSummary items={summaryItems} />
              </SectionCard>

              <SectionCard title="基础信息" description="使用描述列表集中展示只读字段，适合业务对象详情与审批详情页。">
                <div class="example-descriptions">
                  <Descriptions column={2} bordered>
                    <Descriptions.DescriptionsItem label="项目名称">{project.name}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="项目编号">{project.code}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="负责人">{project.owner}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="所属部门">{project.department}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="启动日期">{project.startDate}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="计划完成">{project.endDate}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="项目目标" span={2}>
                      完成园区能耗采集、分析看板与告警闭环，提升能源管理效率。
                    </Descriptions.DescriptionsItem>
                  </Descriptions>
                </div>
              </SectionCard>

              <DetailGrid
                v-slots={{
                  default: () => (
                    <SectionCard title="交付内容" description="主区域放置与当前对象关联的明细表格。">
                      <Descriptions column={1} bordered>
                        <Descriptions.DescriptionsItem label="能耗数据接入">
                          <Space align="center">
                            <Tag theme="success" variant="light">
                              已完成
                            </Tag>
                            <span class="text-secondary">12 个采集点已接入</span>
                          </Space>
                        </Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="分析主题看板">
                          <Space align="center">
                            <Tag theme="primary" variant="light">
                              进行中
                            </Tag>
                            <span class="text-secondary">6 / 8 个主题已交付</span>
                          </Space>
                        </Descriptions.DescriptionsItem>
                        <Descriptions.DescriptionsItem label="告警规则配置">
                          <Space align="center">
                            <Tag theme="warning" variant="light">
                              待验收
                            </Tag>
                            <span class="text-secondary">等待业务方确认阈值</span>
                          </Space>
                        </Descriptions.DescriptionsItem>
                      </Descriptions>
                    </SectionCard>
                  ),
                  aside: () => (
                    <SectionCard title="项目动态" description="侧栏通过时间线展示近期进展与操作记录。">
                      <Timeline mode="same" theme="dot">
                        <Timeline.TimelineItem label="2026-03-26 14:30">
                          <div class="detail-timeline__content">
                            <strong>完成能耗看板评审</strong>
                            <p>评审通过，进入开发验收阶段。</p>
                          </div>
                        </Timeline.TimelineItem>
                        <Timeline.TimelineItem label="2026-03-24 09:15">
                          <div class="detail-timeline__content">
                            <strong>更新项目进度至 68%</strong>
                            <p>本阶段交付内容按计划推进。</p>
                          </div>
                        </Timeline.TimelineItem>
                        <Timeline.TimelineItem label="2026-03-18 17:40">
                          <div class="detail-timeline__content">
                            <strong>接入全部能耗采集点</strong>
                            <p>数据质量检查已完成。</p>
                          </div>
                        </Timeline.TimelineItem>
                      </Timeline>
                    </SectionCard>
                  )
                }}
              />

              <SectionCard title="项目说明">
                <p class="detail-note">
                  本页面为静态详情模板，展示概览指标、基础信息、关联明细与操作记录的组合方式。接入业务时可将各区域替换为接口数据，并保留相同的信息层级与响应式布局。
                </p>
              </SectionCard>

              {/* 无壳层注入时的本地降级：同一 SidePanel 组件以 overlay 抽屉呈现 */}
              <SidePanel
                visible={!panel && localPanelVisible.value}
                v-model:collapsed={localPanelCollapsed.value}
                title="项目详情"
                width={420}
                mode="overlay"
                onClose={() => {
                  localPanelVisible.value = false
                }}
                v-slots={{ default: () => <ProjectPanelContent projectCode={project.code} /> }}
              />
            </>
          )
        }}
      </PageContainer>
    )
  }
})
