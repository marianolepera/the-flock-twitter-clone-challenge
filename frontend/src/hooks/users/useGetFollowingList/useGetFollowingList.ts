import { useInfiniteQuery } from '@tanstack/react-query'

import { getFollowing } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'
import { getNextPageNumber } from '@/lib/get-next-page-number'

const DEFAULT_LIMIT = 20

export function useGetFollowingList(username: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...userKeys.following(username), 'list'] as const,
    queryFn: ({ pageParam }) =>
      getFollowing(username, { page: pageParam, limit: DEFAULT_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: getNextPageNumber,
    enabled: Boolean(username) && enabled,
  })
}
