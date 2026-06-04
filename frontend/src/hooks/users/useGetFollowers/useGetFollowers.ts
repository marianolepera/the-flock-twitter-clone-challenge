import { useInfiniteQuery } from '@tanstack/react-query'

import { getFollowers } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'
import { getNextPageNumber } from '@/lib/get-next-page-number'

const DEFAULT_LIMIT = 20

export function useGetFollowers(username: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: userKeys.followers(username),
    queryFn: ({ pageParam }) =>
      getFollowers(username, { page: pageParam, limit: DEFAULT_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: getNextPageNumber,
    enabled: Boolean(username) && enabled,
  })
}
