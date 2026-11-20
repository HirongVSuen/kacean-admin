import type { AdminModuleManifest } from '@kacean/types'
import DemoList from './views/List'

/** 模块自描述清单：菜单与路由同源，shell 注册后统一聚合 */
export const manifest: AdminModuleManifest = {
  name: 'demo-module',
  permissions: ['demo-module:list'],
  menus: [
    {
      path: '/demo-module',
      title: '示例模块',
      icon: 'app',
      group: '操作空间',
      order: 10,
      permission: 'demo-module:list',
      children: [
        {
          path: '/demo-module/list',
          title: '列表示例',
          icon: 'list',
          order: 0,
          permission: 'demo-module:list'
        }
      ]
    }
  ],
  routes: [{ path: '/demo-module/list', component: DemoList }]
}
