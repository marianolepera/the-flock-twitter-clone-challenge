import type { PaginatedResponse } from '@/types/api.types'

export function getNextPageNumber<T>(lastPage: PaginatedResponse<T>) {
  const totalPages = Math.ceil(lastPage.total / lastPage.limit)
  return lastPage.page < totalPages ? lastPage.page + 1 : undefined
}
