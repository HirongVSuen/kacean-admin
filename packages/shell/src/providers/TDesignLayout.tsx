import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  Aside,
  Avatar,
  Button,
  Content,
  Dialog,
  Dropdown,
  Header,
  HeadMenu,
  Layout,
  Menu,
  MenuGroup,
  MenuItem,
  RadioGroup,
  Submenu,
  Switch,
  Tooltip
} from 'tdesign-vue-next'
import type { DropdownOption } from 'tdesign-vue-next'
import type { AdminUser, LayoutProvider, ModuleMenuItem } from '@kacean/types'
import type { AdminKernel } from '@kacean/core'
import AppIcon from '../components/AppIcon'
import { useLayoutPreferences } from './useLayoutPreferences'
import '../styles/layout.css'

/** 递归渲染菜单树，含子菜单的节点渲染为 Submenu */
function renderMenuItems(items: ModuleMenuItem[]) {
  return items.map((item) => {
    const icon = () => <AppIcon name={item.icon} />

    return item.children?.length ? (
      <Submenu key={item.path} value={item.path} title={item.title} icon={icon} popupProps={{ attach: 'body' }}>
        {renderMenuItems(item.children)}
      </Submenu>
    ) : (
      <MenuItem key={item.path} value={item.path} icon={icon}>
        {item.title}
      </MenuItem>
    )
  })
}

/** 顶层菜单按 group 聚合；同名分组跨模块合并，组内仍保持 MenuProvider 的排序。 */
function renderSideMenuItems(items: ModuleMenuItem[]) {
  const groups = new Map<string, { title?: string; items: ModuleMenuItem[] }>()

  items.forEach((item, index) => {
    // 未声明 group 的菜单保持原样，且彼此独立，避免被错误合并。
    const key = item.group ? `group:${item.group}` : `ungrouped:${index}`
    const group = groups.get(key) ?? { title: item.group, items: [] }
    group.items.push(item)
    groups.set(key, group)
  })

  return Array.from(groups, ([key, group]) =>
    group.title ? (
      <MenuGroup key={key} title={group.title}>
        {renderMenuItems(group.items)}
      </MenuGroup>
    ) : (
      renderMenuItems(group.items)
    )
  )
}

/** 找到当前路由的菜单链路，用于标题展示和自动展开父级菜单。 */
function findMenuTrail(
  items: ModuleMenuItem[],
  path: string,
  trail: ModuleMenuItem[] = []
): ModuleMenuItem[] | undefined {
  for (const item of items) {
    const currentTrail = [...trail, item]
    if (item.path === path) return currentTrail
    const childTrail = item.children ? findMenuTrail(item.children, path, currentTrail) : undefined
    if (childTrail) return childTrail
  }
  return undefined
}

const userOptions: DropdownOption[] = [
  { content: '个人中心', value: 'profile' },
  { content: '退出登录', value: 'logout' }
]

const brandThemeOptions = [
  { label: '默认', value: 'default' },
  { label: '能源蓝', value: 'energy-blue' },
  { label: '电网绿', value: 'grid-green' }
]

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'system' }
]

const navigationOptions = [
  { label: '侧边导航', value: 'side' },
  { label: '顶部导航', value: 'top' }
]

/**
 * shell 默认 LayoutProvider：支持侧边 / 顶部导航、品牌主题、明暗模式与大屏专注模式。
 * 菜单与登录身份均来自内核；显示偏好仅保存在 shell，不影响无头模式。
 */
export function createTDesignLayoutProvider(kernel: AdminKernel): LayoutProvider {
  const TDesignLayout = defineComponent({
    name: 'TDesignLayout',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const collapsed = ref(false)
      const expandedMenus = ref<string[]>([])
      const user = ref<AdminUser | null>(null)
      const settingsVisible = ref(false)
      const focusControlsVisible = ref(false)
      const focusControls = ref<HTMLElement | null>(null)
      const { preferences } = useLayoutPreferences()
      let mobileMedia: MediaQueryList | undefined

      const handleMobileChange = (event: MediaQueryListEvent) => {
        collapsed.value = event.matches
      }

      const handleGlobalKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && preferences.contentOnly && !settingsVisible.value) {
          preferences.contentOnly = false
        }
      }

      const showFocusControls = () => {
        focusControlsVisible.value = true
      }

      const hideFocusControls = (event: FocusEvent | PointerEvent) => {
        const target = event.target
        if (!(target instanceof Node) || !focusControls.value?.contains(target)) {
          focusControlsVisible.value = false
        }
      }

      const handleFocusControlsFocusOut = (event: FocusEvent) => {
        const nextTarget = event.relatedTarget
        if (!(nextTarget instanceof Node) || !focusControls.value?.contains(nextTarget)) {
          focusControlsVisible.value = false
        }
      }

      const handleMenuChange = (value: string | number) => {
        void router.push(String(value))
      }

      const handleMenuExpand = (values: Array<string | number>) => {
        expandedMenus.value = values.map(String)
      }

      const setBrandTheme = (value: string | number | boolean) => {
        if (value === 'default' || value === 'energy-blue' || value === 'grid-green') {
          preferences.brandTheme = value
        }
      }

      const setTheme = (value: string | number | boolean) => {
        if (value === 'light' || value === 'dark' || value === 'system') {
          preferences.theme = value
        }
      }

      const setNavigation = (value: string | number | boolean) => {
        if (value === 'side' || value === 'top') preferences.navigation = value
      }

      const handleContentOnlyChange = (value: string | number | boolean) => {
        preferences.contentOnly = value === true
        if (preferences.contentOnly) settingsVisible.value = false
      }

      onMounted(() => {
        mobileMedia = window.matchMedia('(max-width: 768px)')
        collapsed.value = mobileMedia.matches
        mobileMedia.addEventListener('change', handleMobileChange)
        window.addEventListener('keydown', handleGlobalKeydown)
        document.addEventListener('pointerdown', hideFocusControls)
      })
      onBeforeUnmount(() => {
        mobileMedia?.removeEventListener('change', handleMobileChange)
        window.removeEventListener('keydown', handleGlobalKeydown)
        document.removeEventListener('pointerdown', hideFocusControls)
      })
      void Promise.resolve(kernel.getUser()).then((current) => (user.value = current))

      // 菜单经内核 MenuProvider 编排过滤，高亮跟随当前路由，点击菜单即跳转
      const menus = computed(() => kernel.getMenus())
      const activeMenu = computed(() => route.path)
      const activeTrail = computed(() => findMenuTrail(menus.value, route.path) ?? [])
      const currentTitle = computed(() => activeTrail.value[activeTrail.value.length - 1]?.title ?? '控制台')

      watch(
        () => preferences.contentOnly,
        () => {
          focusControlsVisible.value = false
        }
      )

      // 路由进入子页面时保留已展开菜单，并自动展开当前路由的所有父级
      watch(
        activeTrail,
        (trail) => {
          const parentPaths = trail.slice(0, -1).map((item) => item.path)
          expandedMenus.value = [...new Set([...expandedMenus.value, ...parentPaths])]
        },
        { immediate: true }
      )

      const renderBrand = (top = false) => (
        <div class={['admin-brand', { 'admin-brand--top': top }]}>
          <div class="admin-brand__mark">K</div>
          {(top || !collapsed.value) && (
            <div class="admin-brand__text">
              <strong>Kacean</strong>
              <span>ADMIN CONSOLE</span>
            </div>
          )}
        </div>
      )

      const renderUser = () => (
        <Dropdown options={userOptions} trigger="click" placement="bottom-right">
          <div class="admin-user">
            <Avatar class="admin-user__avatar" size="36px">
              {(user.value?.name ?? 'A').slice(0, 1).toUpperCase()}
            </Avatar>
            <div class="admin-user__meta">
              <strong>{user.value?.name ?? '未登录'}</strong>
              <span>管理员</span>
            </div>
            <AppIcon name="chevron-down" size={16} />
          </div>
        </Dropdown>
      )

      const renderSettingsButton = () => (
        <Tooltip content="界面设置" placement="bottom">
          <Button
            class="admin-settings-button"
            variant="text"
            shape="square"
            aria-label="界面设置"
            onClick={() => {
              settingsVisible.value = true
            }}
          >
            <AppIcon name="setting" size={20} />
          </Button>
        </Tooltip>
      )

      const renderHeaderActions = () => (
        <div class="admin-header__actions">
          {renderSettingsButton()}
          {renderUser()}
        </div>
      )

      const renderContent = () => (
        <Content class="admin-content">
          <div class="admin-content__inner">
            <RouterView />
          </div>
        </Content>
      )

      const renderSettingsDialog = () => (
        <Dialog
          visible={settingsVisible.value}
          header="界面设置"
          width="560px"
          dialogClassName="layout-settings-dialog"
          footer={false}
          onClose={() => {
            settingsVisible.value = false
          }}
        >
          <div class="layout-settings">
            <section class="layout-setting">
              <div class="layout-setting__copy">
                <strong>品牌主题</strong>
                <span>选择默认、能源蓝或电网绿，业务模块会随 token 整体换肤。</span>
              </div>
              <RadioGroup
                class="layout-setting__options"
                value={preferences.brandTheme}
                options={brandThemeOptions}
                theme="button"
                variant="default-filled"
                onChange={setBrandTheme}
              />
            </section>

            <section class="layout-setting">
              <div class="layout-setting__copy">
                <strong>主题模式</strong>
                <span>切换浅色、深色，或跟随操作系统外观。</span>
              </div>
              <RadioGroup
                class="layout-setting__options"
                value={preferences.theme}
                options={themeOptions}
                theme="button"
                variant="default-filled"
                onChange={setTheme}
              />
            </section>

            <section class="layout-setting">
              <div class="layout-setting__copy">
                <strong>导航位置</strong>
                <span>顶部导航支持多级菜单，空间不足时自动收起到更多菜单。</span>
              </div>
              <RadioGroup
                class="layout-setting__options"
                value={preferences.navigation}
                options={navigationOptions}
                theme="button"
                variant="default-filled"
                onChange={setNavigation}
              />
            </section>

            <section class="layout-setting layout-setting--switch">
              <div class="layout-setting__copy">
                <strong>大屏模式</strong>
                <span>隐藏导航和顶栏，内容区全宽且无内边距显示。</span>
              </div>
              <Switch value={preferences.contentOnly} aria-label="大屏模式" onChange={handleContentOnlyChange} />
            </section>

            <p class="layout-settings__tip">
              设置会自动保存。大屏模式下可通过右上角按钮或 <kbd>Esc</kbd> 恢复布局。
            </p>
          </div>
        </Dialog>
      )

      return () => (
        <Layout
          class={[
            'admin-shell',
            `admin-shell--${preferences.navigation}`,
            { 'is-content-only': preferences.contentOnly }
          ]}
        >
          {!preferences.contentOnly && preferences.navigation === 'side' && (
            <Aside
              width={collapsed.value ? '72px' : '248px'}
              class={['admin-aside', { 'is-collapsed': collapsed.value }]}
            >
              {renderBrand()}

              <nav class="admin-aside__navigation" aria-label="主导航">
                <Menu
                  class="admin-menu"
                  value={activeMenu.value}
                  expanded={expandedMenus.value}
                  collapsed={collapsed.value}
                  onChange={handleMenuChange}
                  onExpand={handleMenuExpand}
                >
                  {renderSideMenuItems(menus.value)}
                </Menu>
              </nav>

              <div class="admin-aside__footer">
                <span class="admin-aside__status-dot" />
                {!collapsed.value && (
                  <div class="admin-aside__version">
                    <strong>Kacean Admin</strong>
                    <span>v1.0.0 · 模块化架构</span>
                  </div>
                )}
              </div>
            </Aside>
          )}

          {preferences.contentOnly ? (
            renderContent()
          ) : preferences.navigation === 'top' ? (
            <>
              <Header height="72px" class="admin-header admin-header--top">
                <HeadMenu
                  class="admin-top-menu"
                  value={activeMenu.value}
                  expandType="popup"
                  onChange={handleMenuChange}
                  logo={() => renderBrand(true)}
                  operations={renderHeaderActions}
                >
                  {renderMenuItems(menus.value)}
                </HeadMenu>
              </Header>
              {renderContent()}
            </>
          ) : (
            <Layout class="admin-main">
              <Header height="72px" class="admin-header">
                <div class="admin-header__left">
                  <Button
                    class="admin-header__collapse"
                    variant="text"
                    shape="square"
                    aria-label={collapsed.value ? '展开菜单' : '折叠菜单'}
                    onClick={() => {
                      collapsed.value = !collapsed.value
                    }}
                  >
                    <AppIcon name={collapsed.value ? 'menu-unfold' : 'menu-fold'} size={20} />
                  </Button>
                  <div class="admin-header__location">
                    <span>控制台</span>
                    <span class="admin-header__location-separator">/</span>
                    <strong>{currentTitle.value}</strong>
                  </div>
                </div>

                {renderHeaderActions()}
              </Header>

              {renderContent()}
            </Layout>
          )}

          {preferences.contentOnly && (
            <div
              ref={focusControls}
              class={['admin-focus-controls', { 'is-expanded': focusControlsVisible.value }]}
              onMouseenter={showFocusControls}
              onMouseleave={() => {
                focusControlsVisible.value = false
              }}
              onFocusin={showFocusControls}
              onFocusout={handleFocusControlsFocusOut}
            >
              <button
                type="button"
                class="admin-focus-controls__trigger"
                aria-label="大屏模式操作"
                aria-expanded={focusControlsVisible.value}
                aria-controls="admin-focus-controls-panel"
                onClick={showFocusControls}
              >
                <AppIcon name="chevron-down" size={18} />
              </button>

              <div
                id="admin-focus-controls-panel"
                class="admin-focus-controls__panel"
                role="toolbar"
                aria-label="大屏模式操作"
                aria-hidden={!focusControlsVisible.value}
              >
                <div class="admin-focus-controls__surface">
                  <Tooltip content="退出大屏模式（Esc）" placement="left">
                    <Button
                      variant="text"
                      shape="square"
                      aria-label="退出大屏模式"
                      onClick={() => {
                        preferences.contentOnly = false
                      }}
                    >
                      <AppIcon name="fullscreen-exit" size={20} />
                    </Button>
                  </Tooltip>
                  <Tooltip content="界面设置" placement="left">
                    <Button
                      class="admin-settings-button"
                      variant="text"
                      shape="square"
                      aria-label="界面设置"
                      onClick={() => {
                        settingsVisible.value = true
                      }}
                    >
                      <AppIcon name="setting" size={20} />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}

          {renderSettingsDialog()}
        </Layout>
      )
    }
  })

  return { component: TDesignLayout }
}
