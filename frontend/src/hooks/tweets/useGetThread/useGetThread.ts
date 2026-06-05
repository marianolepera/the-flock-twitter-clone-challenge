import { useQuery } from '@tanstack/react-query'

import { getThread } from '@/api/tweets/tweets-api'
import { tweetKeys } from '@/hooks/tweets/query-keys'

export function useGetThread(tweetId: string) {
  return useQuery({
    queryKey: tweetKeys.thread(tweetId),
    queryFn: () => getThread(tweetId),
    enabled: Boolean(tweetId),
  })
}
