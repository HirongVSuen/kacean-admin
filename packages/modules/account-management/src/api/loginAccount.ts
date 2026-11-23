import type { HttpClient } from '@kacean/common'
import type { Query } from '@kacean/types'

/** 对应后端 LoginAccountDTO；int64 id 在 JSON 解析阶段转为字符串，避免雪花 ID 精度丢失。 */
export interface LoginAccountRecord {
  id: string
  externalNo?: string
  createAt?: string
  createBy?: string
  modifyAt?: string
  modifyBy?: string
  version?: number
  loginAccount: string
  /** 后端返回的密码哈希，仅用于编辑时原样回传，不在界面展示。 */
  loginPassword?: string
  /** 账号状态：0-禁用，1-启用 */
  accountStatus: number
}

/** 新增与更新只提交可维护字段及更新所需标识，不回写审计字段。 */
export interface LoginAccountPayload {
  id?: string
  externalNo?: string
  loginAccount: string
  loginPassword: string
  accountStatus: number
}

/** 后端 JSON 将 int64 id 输出为 number，统一按字符串解析，避免更新/删除使用错误主键。 */
function parseLoginAccountJson(text: string): unknown {
  const normalized = text.replace(/("id"\s*:\s*)(-?\d+)(?=\s*[,}])/g, '$1"$2"')
  return JSON.parse(normalized) as unknown
}

export function createLoginAccountApi(client: HttpClient) {
  return {
    /** 后端 page 的 total 与分页大小当前未生效，改用条件列表，由视图完成前端分页。 */
    list: (query: Query, signal?: AbortSignal) =>
      client.post<LoginAccountRecord[]>('/login-account/listByQuery', query, {
        signal,
        parseJson: parseLoginAccountJson
      }),
    create: (payload: LoginAccountPayload) => client.post<boolean>('/login-account/save', payload),
    /** 更新按 id + externalNo 定位；实测携带 version 会被后端乐观锁误判而间歇 500，故不回传。 */
    update: (payload: LoginAccountPayload) => client.post<boolean>('/login-account/saveOrUpdate', payload),
    remove: (id: string) => client.post<boolean>('/login-account/removeById', undefined, { params: { id } })
  }
}

export type LoginAccountApi = ReturnType<typeof createLoginAccountApi>
