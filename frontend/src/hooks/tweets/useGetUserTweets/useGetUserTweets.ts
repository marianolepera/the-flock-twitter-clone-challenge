import { useInfiniteQuery } from '@tanstack/react-query'

import { getUserTweets } from '@/api/users/users-api'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import { getNextPageNumber } from '@/lib/get-next-page-number'

const DEFAULT_LIMIT = 20

export function useGetUserTweets(username: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: [...tweetKeys.byUser(username), 'feed'] as const,
    queryFn: ({ pageParam }) =>
      getUserTweets(username, { page: pageParam, limit: DEFAULT_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: getNextPageNumber,
    enabled: Boolean(username) && enabled,
  })
}
