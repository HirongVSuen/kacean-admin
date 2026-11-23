/** 默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20

/** 每页记录数上限（对应后端 PageQuery.MAX_PAGE_SIZE），防止单次拉取过多数据 */
export const MAX_PAGE_SIZE = 200

/**
 * 计算总页数（与后端 PageResult.totalPages 一致）：按记录总数与页大小向上取整，无记录时为 0。
 */
export function calcTotalPages(total: number, pageSize: number): number {
  if (total <= 0) return 0
  return Math.ceil(total / pageSize)
}
