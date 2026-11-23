import { defineComponent, h, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Component } from 'vue'
import type { PanelController, PanelOpenOptions } from '@kacean/types'
import { SidePanel } from '@kacean/shared'

interface GlobalPanelState {
  visible: boolean
  collapsed: boolean
  width: number
  title: string
  component: Component | null
  props: Record<string, unknown>
  closeOnRouteChange: boolean
}

interface PanelPreferences {
  width: number
  collapsed: boolean
}

const STORAGE_KEY = 'kacean-admin.global-panel'
const DEFAULT_WIDTH = 400
const MIN_WIDTH = 280
const MAX_WIDTH = 720

function clampWidth(width: number): number {
  if (!Number.isFinite(width)) return DEFAULT_WIDTH
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(width)))
}

/** 读取本地持久化的宽度与收缩状态，损坏存储不阻断启动。 */
function readPanelPreferences(): PanelPreferences {
  if (typeof window === 'undefined') return { width: DEFAULT_WIDTH, collapsed: false }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { width: DEFAULT_WIDTH, collapsed: false }
    const parsed = JSON.parse(stored) as Partial<PanelPreferences>
    return {
      width: typeof parsed.width === 'number' ? clampWidth(parsed.width) : DEFAULT_WIDTH,
      collapsed: parsed.collapsed === true
    }
  } catch {
    return { width: DEFAULT_WIDTH, collapsed: false }
  }
}

/**
 * shell 全局右侧面板：状态 + 控制器 + 宿主组件。
 * 控制器通过 PANEL_CONTROLLER_KEY 注入给业务模块（在 TDesignLayout 中 provide），
 * 宿主组件复用 @kacean/shared 的 SidePanel，与模块本地面板同一实现。
 */
export function createGlobalPanel() {
  const persisted = readPanelPreferences()
  const state = reactive<GlobalPanelState>({
    visible: false,
    collapsed: persisted.collapsed,
    width: persisted.width,
    title: '',
    component: null,
    props: {},
    closeOnRouteChange: true
  })

  watch(
    () => [state.width, state.collapsed] as const,
    ([width, collapsed]) => {
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ width, collapsed }))
      } catch {
        // 隐私模式或存储配额异常时仅保留当前会话状态。
      }
    }
  )

  const controller: PanelController = {
    open(options: PanelOpenOptions) {
      state.title = options.title ?? '详情'
      state.width = clampWidth(options.width ?? state.width)
      state.component = options.component
      state.props = options.props ?? {}
      state.closeOnRouteChange = options.closeOnRouteChange !== false
      // 打开时默认展开，避免内容不可见；收缩状态由后续操作持久化。
      state.collapsed = options.collapsed === true
      state.visible = true
    },
    close() {
      state.visible = false
      state.component = null
      state.props = {}
    },
    toggleCollapsed() {
      state.collapsed = !state.collapsed
    },
    isVisible: () => state.visible
  }

  /** 路由变化时按当前面板的 closeOnRouteChange 约定自动关闭（在布局组件中调用）。 */
  const handleRouteChange = () => {
    if (state.visible && state.closeOnRouteChange) controller.close()
  }

  const GlobalPanelHost = defineComponent({
    name: 'GlobalPanelHost',
    setup() {
      // 窄屏自动切换为 overlay 抽屉，避免 dock 挤压内容区。
      const overlayMedia = window.matchMedia('(max-width: 900px)')
      const overlay = ref(overlayMedia.matches)
      const handleOverlayChange = (event: MediaQueryListEvent) => {
        overlay.value = event.matches
      }

      onMounted(() => overlayMedia.addEventListener('change', handleOverlayChange))
      onBeforeUnmount(() => overlayMedia.removeEventListener('change', handleOverlayChange))

      return () => (
        <SidePanel
          visible={state.visible}
          collapsed={state.collapsed}
          width={state.width}
          title={state.title}
          mode={overlay.value ? 'overlay' : 'dock'}
          onClose={controller.close}
          v-slots={{
            default: () => (state.component ? h(state.component, state.props) : null)
          }}
          {...{
            'onUpdate:collapsed': (value: boolean) => {
              state.collapsed = value
            }
          }}
        />
      )
    }
  })

  return { state, controller, handleRouteChange, GlobalPanelHost }
}
