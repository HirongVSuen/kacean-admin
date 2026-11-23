import type { HttpClient } from '@kacean/common'
import type { Query } from '@kacean/types'

/** 对应后端 TicketTypeDTO；int64 id 在 JSON 解析阶段转为字符串，避免雪花 ID 精度丢失。 */
export interface TicketTypeRecord {
  id: string
  externalNo?: string
  createAt?: string
  createBy?: string
  modifyAt?: string
  modifyBy?: string
  version?: number
  ticketTypeName: string
  catalogNo: string
}

/** 新增与更新只提交可维护字段及更新所需标识，不回写审计字段。 */
export interface TicketTypePayload {
  id?: string
  externalNo?: string
  version?: number
  ticketTypeName: string
  catalogNo: string
}

/** 数值形式的 int64 id 统一按字符串解析，避免 JSON.parse 精度丢失。 */
function parseTicketTypeJson(text: string): unknown {
  const normalized = text.replace(/("id"\s*:\s*)(-?\d+)(?=\s*[,}])/g, '$1"$2"')
  return JSON.parse(normalized) as unknown
}

/** 该控制器文档与实际部署存在有无 Result 包装的差异；显式兼容两种响应，有包装时仍校验业务码。 */
const compatibleResponseOptions = { responseFormat: 'auto', parseJson: parseTicketTypeJson } as const

export function createTicketTypeApi(client: HttpClient) {
  return {
    /** 后端 PageResult.total 存在异常时使用筛选列表，由视图完成前端分页。 */
    list: (query: Query, signal?: AbortSignal) =>
      client.post<TicketTypeRecord[]>('/ticket-type/listByQuery', query, {
        ...compatibleResponseOptions,
        signal
      }),
    create: (payload: TicketTypePayload) =>
      client.post<boolean>('/ticket-type/save', payload, compatibleResponseOptions),
    update: (payload: TicketTypePayload) =>
      client.post<boolean>('/ticket-type/saveOrUpdate', payload, compatibleResponseOptions),
    remove: (id: string) =>
      client.post<boolean>('/ticket-type/removeById', undefined, {
        ...compatibleResponseOptions,
        params: { id }
      })
  }
}

export type TicketTypeApi = ReturnType<typeof createTicketTypeApi>
