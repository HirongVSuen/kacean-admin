import type { HttpClient } from '@kacean/common'
import type { Query } from '@kacean/types'
import { parseDataDictJson } from './dataDict'

/** 对应后端 DataDictValueDTO；id / dictId 均为雪花 int64，按字符串处理。 */
export interface DataDictValueRecord {
  id: string
  externalNo?: string
  createAt?: string
  createBy?: string
  modifyAt?: string
  modifyBy?: string
  version?: number
  /** 数据字典主表 ID */
  dictId: string
  /** 字典编码 */
  dictCode: string
  /** 字典中文值 */
  dictValue: string
}

/**
 * 新增与更新只提交可维护字段及更新所需标识，dictId 以字符串原样回传，避免精度丢失。
 * 与字典主表一致：saveOrUpdate 回传 version 会触发 500，更新不携带乐观锁版本号。
 */
export interface DataDictValuePayload {
  id?: string
  externalNo?: string
  dictId: string
  dictCode: string
  dictValue: string
}

export function createDataDictValueApi(client: HttpClient) {
  return {
    /**
     * 与字典主表一致：page 的 total / pageNum 未生效，Query 也不支持 dictId 条件，
     * 取全量后由视图按 dictId 与关键字本地过滤、分页。
     */
    list: (query: Query, signal?: AbortSignal) =>
      client.post<DataDictValueRecord[]>('/data-dict-value/listByQuery', query, {
        signal,
        parseJson: parseDataDictJson
      }),
    create: (payload: DataDictValuePayload) => client.post<boolean>('/data-dict-value/save', payload),
    update: (payload: DataDictValuePayload) => client.post<boolean>('/data-dict-value/saveOrUpdate', payload),
    remove: (id: string) => client.post<boolean>('/data-dict-value/removeById', undefined, { params: { id } })
  }
}

export type DataDictValueApi = ReturnType<typeof createDataDictValueApi>
