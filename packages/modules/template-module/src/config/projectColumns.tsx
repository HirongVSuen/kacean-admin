import { Button, Progress, Tag } from 'tdesign-vue-next'
import type { PrimaryTableCol } from 'tdesign-vue-next'
import type { ProjectRecord, ProjectStatus } from '../data/projects'

const statusThemes: Record<ProjectStatus, 'primary' | 'success' | 'warning'> = {
  进行中: 'primary',
  已完成: 'success',
  待启动: 'warning'
}

export function createProjectColumns(withActions = true): PrimaryTableCol[] {
  const columns: PrimaryTableCol[] = [
    {
      title: '项目名称',
      colKey: 'name',
      minWidth: 220,
      cell: (_h, { row }) => {
        const project = row as ProjectRecord
        return (
          <div class="project-cell">
            <strong>{project.name}</strong>
            <span>{project.id}</span>
          </div>
        )
      }
    },
    { title: '负责人', colKey: 'owner', width: 90 },
    { title: '所属部门', colKey: 'department', width: 130, ellipsis: true },
    {
      title: '项目进度',
      colKey: 'progress',
      width: 150,
      cell: (_h, { row }) => <Progress percentage={(row as ProjectRecord).progress} size="small" />
    },
    {
      title: '状态',
      colKey: 'status',
      width: 100,
      cell: (_h, { row }) => {
        const project = row as ProjectRecord
        return (
          <Tag theme={statusThemes[project.status]} variant="light">
            {project.status}
          </Tag>
        )
      }
    },
    { title: '更新时间', colKey: 'updatedAt', width: 120 }
  ]

  if (withActions) {
    columns.push({
      title: '操作',
      colKey: 'actions',
      width: 130,
      fixed: 'right',
      cell: () => (
        <div class="table-actions">
          <Button variant="text" size="small">
            查看
          </Button>
          <Button variant="text" size="small">
            编辑
          </Button>
        </div>
      )
    })
  }

  return columns
}
