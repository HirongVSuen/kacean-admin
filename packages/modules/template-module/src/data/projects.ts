export type ProjectStatus = '进行中' | '已完成' | '待启动'

export interface ProjectRecord {
  id: string
  name: string
  owner: string
  department: string
  category: string
  progress: number
  status: ProjectStatus
  updatedAt: string
}

const projectNames = ['客户运营平台', '数据治理中心', '智慧能源驾驶舱', '统一门户升级', '移动协同办公', '设备资产台账']
const owners = ['林晓', '陈宇', '周宁', '赵清', '王可', '孙然']
const departments = ['产品设计部', '数据平台部', '能源事业部', '研发中心']
const categories = ['平台建设', '数据治理', '应用升级']

/** 固定生成本地数据，便于反复演示分页而不依赖接口。 */
export const projectRows: ProjectRecord[] = Array.from({ length: 46 }, (_, index) => {
  const phase = Math.floor(index / projectNames.length) + 1
  return {
    id: `PRJ-2025-${String(index + 1).padStart(3, '0')}`,
    name: `${projectNames[index % projectNames.length]} · ${phase} 期`,
    owner: owners[index % owners.length],
    department: departments[index % departments.length],
    category: categories[index % categories.length],
    progress: (index * 17 + 24) % 101,
    status: index % 5 === 0 ? '待启动' : index % 3 === 0 ? '已完成' : '进行中',
    updatedAt: `2025-05-${String((index % 28) + 1).padStart(2, '0')}`
  }
})
