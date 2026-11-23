import type { TreeOptionData } from 'tdesign-vue-next'

/** 组织架构静态示例：仅用于树组件页面演示。 */
export const organizationTree: TreeOptionData[] = [
  {
    value: 'platform',
    label: '能源数据服务平台',
    children: [
      {
        value: 'dept-operation',
        label: '平台运营组',
        children: [
          { value: 'operation-content', label: '内容运营' },
          { value: 'operation-activity', label: '活动运营' },
          { value: 'operation-success', label: '客户成功' }
        ]
      },
      {
        value: 'dept-product',
        label: '产品研发组',
        children: [
          { value: 'product-design', label: '产品设计' },
          { value: 'product-frontend', label: '前端开发' },
          { value: 'product-backend', label: '后端开发' },
          { value: 'product-qa', label: '测试保障' }
        ]
      },
      {
        value: 'dept-data',
        label: '数据服务组',
        children: [
          { value: 'data-integration', label: '数据接入' },
          { value: 'data-metrics', label: '指标管理' },
          { value: 'data-quality', label: '数据质量' }
        ]
      }
    ]
  }
]

/** 懒加载示例根节点：children 为 true 的节点在首次展开时异步获取子节点。 */
export const serviceCatalogTree: TreeOptionData[] = [
  { value: 'catalog-energy', label: '能耗指标', children: true },
  { value: 'catalog-device', label: '设备台账', children: true },
  { value: 'catalog-report', label: '统计报表', children: true }
]

/** 懒加载示例子节点：按父节点 value 返回，模拟接口分页前的静态响应。 */
export const serviceCatalogChildren: Record<string, TreeOptionData[]> = {
  'catalog-energy': [
    { value: 'energy-power', label: '用电量', children: true },
    { value: 'energy-water', label: '用水量' },
    { value: 'energy-gas', label: '用气量' }
  ],
  'energy-power': [
    { value: 'energy-power-day', label: '日电量曲线' },
    { value: 'energy-power-month', label: '月电量汇总' }
  ],
  'catalog-device': [
    { value: 'device-transformer', label: '变压器' },
    { value: 'device-meter', label: '智能电表' }
  ],
  'catalog-report': [
    { value: 'report-month', label: '月度运营报表' },
    { value: 'report-year', label: '年度能耗分析' }
  ]
}
