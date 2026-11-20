/** 后端接口统一返回结构 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/** 分页请求参数 */
export interface PageQuery {
  pageNum: number
  pageSize: number
}

/** 分页返回结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}
