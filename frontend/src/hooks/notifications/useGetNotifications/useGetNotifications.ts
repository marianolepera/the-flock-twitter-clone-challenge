import { useInfiniteQuery } from '@tanstack/react-query'

import { getNotifications } from '@/api/notifications/notifications-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'

const DEFAULT_LIMIT = 20

export function useGetNotifications(limit = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) =>
      getNotifications({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit)
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined
    },
  })
}
