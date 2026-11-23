import { defineComponent, onBeforeUnmount, Transition, watch } from 'vue'
import type { CSSProperties, PropType } from 'vue'

/** 内联图标：公共组件不依赖 shell 的图标映射，也不新增图标库依赖。 */
const ExpandIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M11 3 6 8l5 5" />
    <path d="M6 3 1 8l5 5" transform="translate(2 0)" />
  </svg>
)

const CollapseIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m5 3 5 5-5 5" />
    <path d="m10 3 5 5-5 5" transform="translate(-2 0)" />
  </svg>
)

const CloseIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="m4 4 8 8M12 4l-8 8" />
  </svg>
)

/**
 * 右侧详情面板（受控展示组件）：
 * - dock：在 flex 行容器内占位展开，收缩为 40px 把手条，父容器负责布局；
 * - overlay：fixed 抽屉，带滑入滑出过渡；mask 控制是否显示遮罩，点击遮罩关闭，适合窄屏与页面内降级使用。
 * 不依赖路由、内核与 shell，业务模块独立开发 / 无头嵌入均可直接使用。
 */
export const SidePanel = defineComponent({
  name: 'KaceanSidePanel',
  props: {
    visible: { type: Boolean, default: false },
    collapsed: { type: Boolean, default: false },
    /** 展开宽度（px），dock 与 overlay 均生效 */
    width: { type: Number, default: 360 },
    title: { type: String, default: '' },
    mode: { type: String as PropType<'dock' | 'overlay'>, default: 'dock' },
    /** 是否显示关闭按钮 */
    showClose: { type: Boolean, default: true },
    /** 是否显示收缩按钮 */
    showCollapse: { type: Boolean, default: true },
    /** Esc 关闭；捕获阶段拦截，避免误触发宿主的 Esc 快捷键 */
    closeOnEsc: { type: Boolean, default: true },
    /** overlay 模式下是否显示遮罩；false 时不渲染遮罩，面板外区域保持可交互 */
    mask: { type: Boolean, default: true },
    /** overlay 模式下点击遮罩关闭 */
    closeOnOverlayClick: { type: Boolean, default: true }
  },
  emits: ['close', 'update:collapsed'],
  setup(props, { slots, emit }) {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !props.visible || !props.closeOnEsc) return
      event.stopPropagation()
      emit('close')
    }

    watch(
      () => props.visible,
      (visible) => {
        if (typeof window === 'undefined') return
        if (visible) window.addEventListener('keydown', handleKeydown, true)
        else window.removeEventListener('keydown', handleKeydown, true)
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (typeof window !== 'undefined') window.removeEventListener('keydown', handleKeydown, true)
    })

    return () => {
      const panelStyle = { '--kacean-side-panel-width': `${props.width}px` } as CSSProperties

      return (
        <>
          <Transition name="kacean-side-panel-fade">
            {props.mode === 'overlay' && props.mask && props.visible ? (
              <div
                class="kacean-side-panel__mask"
                aria-hidden="true"
                onClick={() => {
                  if (props.closeOnOverlayClick) emit('close')
                }}
              />
            ) : null}
          </Transition>

          <Transition name="kacean-side-panel-slide">
            {props.visible ? (
              <aside
                class={['kacean-side-panel', `kacean-side-panel--${props.mode}`, { 'is-collapsed': props.collapsed }]}
                style={panelStyle}
                role="complementary"
                aria-label={props.title || '详情面板'}
              >
                {props.collapsed ? (
                  <button
                    type="button"
                    class="kacean-side-panel__handle"
                    aria-label="展开详情面板"
                    onClick={() => emit('update:collapsed', false)}
                  >
                    {slots.collapsed?.() ?? (
                      <>
                        <ExpandIcon />
                        {props.title && <span class="kacean-side-panel__handle-title">{props.title}</span>}
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <header class="kacean-side-panel__header">
                      <div class="kacean-side-panel__title">{slots.title?.() ?? props.title}</div>
                      <div class="kacean-side-panel__actions">
                        {slots.extra?.()}
                        {props.showCollapse && (
                          <button
                            type="button"
                            class="kacean-side-panel__icon-button"
                            aria-label="收缩面板"
                            onClick={() => emit('update:collapsed', true)}
                          >
                            <CollapseIcon />
                          </button>
                        )}
                        {props.showClose && (
                          <button
                            type="button"
                            class="kacean-side-panel__icon-button"
                            aria-label="关闭面板"
                            onClick={() => emit('close')}
                          >
                            <CloseIcon />
                          </button>
                        )}
                      </div>
                    </header>

                    <div class="kacean-side-panel__body">{slots.default?.()}</div>

                    {slots.footer && <footer class="kacean-side-panel__footer">{slots.footer()}</footer>}
                  </>
                )}
              </aside>
            ) : null}
          </Transition>
        </>
      )
    }
  }
})

export type SidePanelProps = InstanceType<typeof SidePanel>['$props']
