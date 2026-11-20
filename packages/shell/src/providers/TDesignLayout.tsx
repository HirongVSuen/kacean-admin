import { computed, defineComponent, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  Aside,
  Avatar,
  Button,
  Content,
  Dropdown,
  Header,
  Layout,
  Menu,
  MenuItem,
  Space,
  Submenu
} from 'tdesign-vue-next'
import type { DropdownOption } from 'tdesign-vue-next'
import type { AdminUser, LayoutProvider, ModuleMenuItem } from '@kacean/types'
import type { AdminKernel } from '@kacean/core'

/** 递归渲染菜单树，含子菜单的节点渲染为 Submenu */
function renderMenuItems(items: ModuleMenuItem[]) {
  return items.map((item) =>
    item.children?.length ? (
      <Submenu key={item.path} value={item.path} title={item.title}>
        {renderMenuItems(item.children)}
      </Submenu>
    ) : (
      <MenuItem key={item.path} value={item.path}>
        {item.title}
      </MenuItem>
    )
  )
}

const userOptions: DropdownOption[] = [
  { content: '个人中心', value: 'profile' },
  { content: '退出登录', value: 'logout' }
]

/**
 * shell 默认 LayoutProvider：TDesign 布局骨架（侧边菜单 + 顶栏 + 内容区）。
 * 菜单与登录身份均来自内核；不注册该 Provider 时即为无头模式，由宿主自渲染骨架。
 */
export function createTDesignLayoutProvider(kernel: AdminKernel): LayoutProvider {
  const TDesignLayout = defineComponent({
    name: 'TDesignLayout',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const collapsed = ref(false)
      const user = ref<AdminUser | null>(null)
      void Promise.resolve(kernel.getUser()).then((current) => (user.value = current))

      // 菜单经内核 MenuProvider 编排过滤，高亮跟随当前路由，点击菜单即跳转
      const menus = computed(() => kernel.getMenus())
      const activeMenu = computed(() => route.path)

      return () => (
        <Layout class="h-screen">
          <Aside width={collapsed.value ? '64px' : '232px'} class="transition-all">
            <div class="h-16 flex-center text-lg font-bold text-[var(--td-brand-color)]">
              {collapsed.value ? 'K' : 'kacean-admin'}
            </div>
            <Menu value={activeMenu.value} collapsed={collapsed.value} onChange={(value) => router.push(String(value))}>
              {renderMenuItems(menus.value)}
            </Menu>
          </Aside>
          <Layout>
            <Header class="flex items-center justify-between px-6 bg-container">
              <Button variant="text" onClick={() => (collapsed.value = !collapsed.value)}>
                {collapsed.value ? '展开菜单' : '折叠菜单'}
              </Button>
              <Dropdown options={userOptions} trigger="click">
                <Space size={8} class="cursor-pointer">
                  <Avatar size="32px">A</Avatar>
                  <span>{user.value?.name ?? '未登录'}</span>
                </Space>
              </Dropdown>
            </Header>
            <Content class="p-6 bg-[var(--td-bg-color-page)]">
              <RouterView />
            </Content>
          </Layout>
        </Layout>
      )
    }
  })

  return { component: TDesignLayout }
}
