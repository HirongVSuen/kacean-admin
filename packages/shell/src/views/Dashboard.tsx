import { computed, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Card, Tag } from 'tdesign-vue-next'
import { DEFAULT_PAGE_SIZE, isSuccessResponse } from '@kacean/common'
import type { ApiResponse } from '@kacean/types'
import AppIcon from '../components/AppIcon'
import '../styles/dashboard.css'

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    // 公共包链路自检：types → common → shared → shell
    const res: ApiResponse<string> = { code: '0', message: 'ok', data: 'types → common → shared → shell 全部打通' }
    const demoMessage = computed(() => (isSuccessResponse(res) ? res.data : res.message))

    const overviewItems = computed(() => [
      {
        label: '模块加载',
        value: '已就绪',
        suffix: '',
        description: '业务模块通过 manifest 统一接入',
        icon: 'layers'
      },
      {
        label: '公共包链路',
        value: isSuccessResponse(res) ? '正常' : '异常',
        suffix: '',
        description: '类型、工具与共享组件协作正常',
        icon: 'link'
      },
      {
        label: '默认分页',
        value: String(DEFAULT_PAGE_SIZE),
        suffix: '条 / 页',
        description: '由公共常量统一维护分页配置',
        icon: 'list'
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
              模块化管理后台
            </Tag>
            <h1>欢迎回来，开始今天的工作</h1>
            <p>模块、路由与公共能力均已就绪，从这里高效管理你的业务。</p>
            <div class="dashboard-hero__actions">
              <Button theme="primary" onClick={() => router.push('/system/users')}>
                进入用户管理
                <AppIcon name="arrow-right" size={16} />
              </Button>
              <Button variant="outline" onClick={() => router.push('/settings')}>
                系统设置
              </Button>
            </div>
          </div>
          <div class="dashboard-hero__visual" aria-hidden="true">
            <AppIcon name="layers" size={72} />
          </div>
        </section>

        <section class="dashboard-overview" aria-label="系统概览">
          {overviewItems.value.map((item) => (
            <Card key={item.label} class="dashboard-stat" bordered>
              <div class="dashboard-stat__header">
                <span>{item.label}</span>
                <span class="dashboard-stat__icon">
                  <AppIcon name={item.icon} size={20} />
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
              <button type="button" class="dashboard-shortcut" onClick={() => router.push('/system/users')}>
                <span class="dashboard-shortcut__icon">
                  <AppIcon name="user" size={20} />
                </span>
                <span class="dashboard-shortcut__content">
                  <strong>用户管理</strong>
                  <span>维护平台用户、账号状态与角色权限</span>
                </span>
                <AppIcon name="arrow-right" size={18} />
              </button>
              <button type="button" class="dashboard-shortcut" onClick={() => router.push('/settings')}>
                <span class="dashboard-shortcut__icon">
                  <AppIcon name="setting" size={20} />
                </span>
                <span class="dashboard-shortcut__content">
                  <strong>系统设置</strong>
                  <span>管理平台偏好与通用配置</span>
                </span>
                <AppIcon name="arrow-right" size={18} />
              </button>
            </div>
          </Card>

          <Card title="基座能力" bordered>
            <div class="dashboard-capabilities">
              {capabilityItems.value.map((item) => (
                <div key={item.title} class="dashboard-capability">
                  <AppIcon class="dashboard-capability__icon" name="check-circle" size={20} />
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
