import type { ApiResponse } from '@kacean/types'

/** 成功响应码（对应后端 Result.SUCCESS_CODE），禁止用于失败响应 */
export const SUCCESS_CODE = '0'

/** 参数校验失败响应码（对应后端 Result.VALIDATION_ERROR_CODE），此时 data 可携带具体错误详情 */
export const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR'

/** 判断接口是否成功（按后端 Result 约定，code === '0' 为成功） */
export function isSuccessResponse<T>(res: ApiResponse<T>): boolean {
  return res.code === SUCCESS_CODE
}

/** 判断是否为参数校验失败响应，data 中可携带字段级错误详情 */
export function isValidationErrorResponse<T>(res: ApiResponse<T>): boolean {
  return res.code === VALIDATION_ERROR_CODE
}
