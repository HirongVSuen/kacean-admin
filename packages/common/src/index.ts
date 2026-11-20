import type { ApiResponse } from '@kacean/types'

/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20

/** 判断接口是否成功（按 code === 0 为成功约定，可按后端实际调整） */
export function isSuccessResponse<T>(res: ApiResponse<T>): boolean {
  return res.code === 0
}
