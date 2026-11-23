import { computed, defineComponent, getCurrentInstance } from 'vue'
import { Button, Card, Tag } from 'tdesign-vue-next'
import { DEFAULT_PAGE_SIZE, isSuccessResponse } from '@kacean/common'
import type { ApiResponse } from '@kacean/types'
import './Dashboard.css'

type DashboardIconName = 'layers' | 'link' | 'list' | 'app' | 'check-circle' | 'arrow-right'

function renderIconPath(name: DashboardIconName) {
  switch (name) {
    case 'layers':
      return (
        <>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
        </>
      )
    case 'link':
      return (
        <>
          <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07L13 19.07" />
        </>
      )
    case 'list':
      return (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
      )
    case 'check-circle':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </>
      )
    case 'arrow-right':
      return <path d="M5 12h14M13 6l6 6-6 6" />
    case 'app':
    default:
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 21V9" />
        </>
      )
  }
}

/** 工作台内的轻量装饰图标，菜单图标仍由 shell 按名称统一映射。 */
function DashboardIcon(props: { name: DashboardIconName; size?: number; class?: string }) {
  return (
    <svg
      class={['app-icon t-icon', props.class]}
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {renderIconPath(props.name)}
    </svg>
  )
}

export default defineComponent({
  name: 'TemplateDashboardView',
  emits: ['navigate'],
  setup(_props, { emit }) {
    const instance = getCurrentInstance()
    // 公共包链路自检：types → common → shared → template-module
    const res: ApiResponse<string> = {
      code: '0',
      message: 'ok',
      data: 'types → common → shared → template-module 全部打通'
    }
    const demoMessage = computed(() => (isSuccessResponse(res) ? res.data : res.message))

    const navigate = (path: string) => {
      // 集成模式使用宿主安装的 Vue Router；独立开发壳通过 navigate 事件切换页面。
      const globalProperties = instance?.appContext.config.globalProperties as Record<string, unknown> | undefined
      const router = globalProperties?.$router as { push: (target: string) => unknown } | undefined
      if (router) {
        void router.push(path)
        return
      }
      emit('navigate', path)
    }

    const overviewItems = computed(() => [
      {
        label: '模块加载',
        value: '已就绪',
        suffix: '',
        description: '业务模块通过 manifest 统一接入',
        icon: 'layers' as const
      },
      {
        label: '公共包链路',
        value: isSuccessResponse(res) ? '正常' : '异常',
        suffix: '',
        description: '类型、工具与共享组件协作正常',
        icon: 'link' as const
      },
      {
        label: '默认分页',
        value: String(DEFAULT_PAGE_SIZE),
        suffix: '条 / 页',
        description: '由公共常量统一维护分页配置',
        icon: 'list' as const
      }
    ])

    const capabilityItems = computed(() => [
      { title: '公共包链路', description: demoMessage.value },
      { title: '界面技术栈', description: 'TSX + TDesign + UnoCSS' },
      { title: '模块构建产物', description: 'ESM + UMD 双产物' }
    ])

    return () => (
      <div class="dashboard-page">
        <section class="dashboard-hero">
          <div class="dashboard-hero__content">
            <Tag theme="primary" variant="light">
              静态业务工作台
            </Tag>
            <h1>欢迎回来，开始今天的工作</h1>
            <p>通过本地 mock 与静态交互，了解模块、路由和公共能力的组合方式。</p>
            <div class="dashboard-hero__actions">
              <Button theme="primary" onClick={() => navigate('/template-module/table-pagination')}>
                查看项目列表
                <DashboardIcon name="arrow-right" size={16} />
              </Button>
              <Button variant="outline" onClick={() => navigate('/template-module/step-form')}>
                打开分步表单
              </Button>
            </div>
          </div>
          <div class="dashboard-hero__visual" aria-hidden="true">
            <DashboardIcon name="layers" size={72} />
          </div>
        </section>

        <section class="dashboard-overview" aria-label="模板概览">
          {overviewItems.value.map((item) => (
            <Card key={item.label} class="dashboard-stat" bordered>
              <div class="dashboard-stat__header">
                <span>{item.label}</span>
                <span class="dashboard-stat__icon">
                  <DashboardIcon name={item.icon} size={20} />
                </span>
              </div>
              <div class="dashboard-stat__value">
                {item.value}
                {item.suffix && <small>{item.suffix}</small>}
              </div>
              <p>{item.description}</p>
            </Card>
          ))}
        </section>

        <section class="dashboard-details">
          <Card title="快捷入口" bordered>
            <div class="dashboard-shortcuts">
              <button
                type="button"
                class="dashboard-shortcut"
                onClick={() => navigate('/template-module/table-pagination')}
              >
                <span class="dashboard-shortcut__icon">
                  <DashboardIcon name="list" size={20} />
                </span>
                <span class="dashboard-shortcut__content">
                  <strong>数据表格模板</strong>
                  <span>使用本地项目数据演示查询、筛选与分页</span>
                </span>
                <DashboardIcon name="arrow-right" size={18} />
              </button>
              <button type="button" class="dashboard-shortcut" onClick={() => navigate('/template-module/step-form')}>
                <span class="dashboard-shortcut__icon">
                  <DashboardIcon name="app" size={20} />
                </span>
                <span class="dashboard-shortcut__content">
                  <strong>分步表单</strong>
                  <span>查看静态分步填写、校验与确认交互</span>
                </span>
                <DashboardIcon name="arrow-right" size={18} />
              </button>
            </div>
          </Card>

          <Card title="基座能力" bordered>
            <div class="dashboard-capabilities">
              {capabilityItems.value.map((item) => (
                <div key={item.title} class="dashboard-capability">
                  <DashboardIcon class="dashboard-capability__icon" name="check-circle" size={20} />
                  <div class="dashboard-capability__content">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>
                  <Tag theme="success" variant="light">
                    正常
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    )
  }
})
