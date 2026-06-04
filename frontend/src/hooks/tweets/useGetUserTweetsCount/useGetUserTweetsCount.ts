import { useQuery } from '@tanstack/react-query'

import { getUserTweets } from '@/api/users/users-api'
import { tweetKeys } from '@/hooks/tweets/query-keys'

export function useGetUserTweetsCount(username: string) {
  return useQuery({
    queryKey: [...tweetKeys.byUser(username), 'count'] as const,
    queryFn: () => getUserTweets(username, { page: 1, limit: 1 }),
    enabled: Boolean(username),
    select: (data) => data.total,
  })
}
