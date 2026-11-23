import type { HttpClient } from '@kacean/common'
import type { Query } from '@kacean/types'

/** 对应后端 DataDictDTO；int64 id 在 JSON 解析阶段转为字符串，避免雪花 ID 精度丢失。 */
export interface DataDictRecord {
  id: string
  externalNo?: string
  createAt?: string
  createBy?: string
  modifyAt?: string
  modifyBy?: string
  version?: number
  dictName: string
  /** 是否启用：0-禁用，1-启用 */
  isEnabled: number
}

/**
 * 新增与更新只提交可维护字段及更新所需标识，不回写审计字段。
 * 实测后端 saveOrUpdate 回传 version 会触发 500，因此更新不携带乐观锁版本号。
 */
export interface DataDictPayload {
  id?: string
  externalNo?: string
  dictName: string
  isEnabled: number
}

/**
 * 后端 JSON 将 int64 输出为 number，统一把 id / dictId 按字符串解析，
 * 避免超过 Number.MAX_SAFE_INTEGER 后更新、删除或字典值关联使用错误主键。
 */
export function parseDataDictJson(text: string): unknown {
  const normalized = text.replace(/("(?:id|dictId)"\s*:\s*)(-?\d+)(?=\s*[,}\]])/g, '$1"$2"')
  return JSON.parse(normalized) as unknown
}

export function createDataDictApi(client: HttpClient) {
  return {
    /**
     * 后端 /data-dict/page 的 total 与 pageNum 当前未生效（实测 total 恒为 0、翻页返回相同数据），
     * 且 listByQuery 的 keyword 不过滤；改用条件列表取全量，由视图完成本地过滤与分页。
     */
    list: (query: Query, signal?: AbortSignal) =>
      client.post<DataDictRecord[]>('/data-dict/listByQuery', query, {
        signal,
        parseJson: parseDataDictJson
      }),
    create: (payload: DataDictPayload) => client.post<boolean>('/data-dict/save', payload),
    update: (payload: DataDictPayload) => client.post<boolean>('/data-dict/saveOrUpdate', payload),
    remove: (id: string) => client.post<boolean>('/data-dict/removeById', undefined, { params: { id } })
  }
}

export type DataDictApi = ReturnType<typeof createDataDictApi>
