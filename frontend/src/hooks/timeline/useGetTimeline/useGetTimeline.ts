import { useInfiniteQuery } from '@tanstack/react-query'

import { getTimeline } from '@/api/timeline/timeline-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'

const DEFAULT_LIMIT = 20

export function useGetTimeline(limit = DEFAULT_LIMIT) {
  return useInfiniteQuery({
    queryKey: timelineKeys.feed(),
    queryFn: ({ pageParam }) =>
      getTimeline({ cursor: pageParam, limit }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}
