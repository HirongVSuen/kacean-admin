export type TicketType = '工作票' | '操作票'
export type TicketStatus = '待签发' | '待许可' | '执行中' | '已终结'

export interface TicketRecord {
  id: string
  title: string
  type: TicketType
  department: string
  owner: string
  planTime: string
  status: TicketStatus
}

/** 本地静态两票数据，仅用于模块页面与筛选分页交互。 */
export const ticketRows: TicketRecord[] = [
  {
    id: 'GZ-2026-1101',
    title: '110kV 东城线检修工作',
    type: '工作票',
    department: '运维检修部',
    owner: '陈宇',
    planTime: '2026-11-24 08:30',
    status: '执行中'
  },
  {
    id: 'CZ-2026-1102',
    title: '东城变电站 102 开关停电操作',
    type: '操作票',
    department: '变电运维班',
    owner: '刘洋',
    planTime: '2026-11-24 09:00',
    status: '待许可'
  },
  {
    id: 'GZ-2026-1103',
    title: '35kV 南郊线电缆试验',
    type: '工作票',
    department: '运维检修部',
    owner: '徐航',
    planTime: '2026-11-24 13:30',
    status: '待签发'
  },
  {
    id: 'CZ-2026-1104',
    title: '南郊变电站 2 号主变转冷备用',
    type: '操作票',
    department: '调度控制中心',
    owner: '周宁',
    planTime: '2026-11-24 15:00',
    status: '待签发'
  },
  {
    id: 'GZ-2026-1105',
    title: '10kV 西环线配电柜检查',
    type: '工作票',
    department: '配电运检班',
    owner: '孙然',
    planTime: '2026-11-25 08:00',
    status: '待许可'
  },
  {
    id: 'CZ-2026-1106',
    title: '西环开闭所 901 开关送电操作',
    type: '操作票',
    department: '变电运维班',
    owner: '刘洋',
    planTime: '2026-11-25 10:30',
    status: '待签发'
  },
  {
    id: 'GZ-2026-1107',
    title: '北站变压器呼吸器更换',
    type: '工作票',
    department: '运维检修部',
    owner: '陈宇',
    planTime: '2026-11-22 08:30',
    status: '已终结'
  },
  {
    id: 'CZ-2026-1108',
    title: '北站 1 号主变转运行操作',
    type: '操作票',
    department: '调度控制中心',
    owner: '何静',
    planTime: '2026-11-22 16:00',
    status: '已终结'
  },
  {
    id: 'GZ-2026-1109',
    title: '220kV 云台线杆塔巡检',
    type: '工作票',
    department: '输电运检班',
    owner: '徐航',
    planTime: '2026-11-26 07:30',
    status: '待签发'
  },
  {
    id: 'CZ-2026-1110',
    title: '云台变电站 220kV 母线倒闸操作',
    type: '操作票',
    department: '调度控制中心',
    owner: '周宁',
    planTime: '2026-11-26 09:30',
    status: '待许可'
  },
  {
    id: 'GZ-2026-1111',
    title: '高新区环网柜带电检测',
    type: '工作票',
    department: '配电运检班',
    owner: '孙然',
    planTime: '2026-11-23 14:00',
    status: '执行中'
  },
  {
    id: 'CZ-2026-1112',
    title: '高新区 103 环网柜间隔停运操作',
    type: '操作票',
    department: '变电运维班',
    owner: '刘洋',
    planTime: '2026-11-21 11:00',
    status: '已终结'
  }
]
