import { useTimelineUpdates } from '@/context/timeline-updates-context'
import { useGetTimeline } from '@/hooks/timeline/useGetTimeline/useGetTimeline'
import { useLoadMoreOnScroll } from '@/hooks/useLoadMoreOnScroll/useLoadMoreOnScroll'
import { useAuthStore } from '@/stores/auth.store'

export function useTimelineFeed() {
  const user = useAuthStore((s) => s.user)
  const { hasNewTweets, refreshTimeline } = useTimelineUpdates()

  const query = useGetTimeline()
  const tweets = query.data?.pages.flatMap((page) => page.items) ?? []

  const loadMoreRef = useLoadMoreOnScroll(
    Boolean(query.hasNextPage && !query.isFetchingNextPage),
    () => {
      void query.fetchNextPage()
    },
  )

  return {
    user,
    hasNewTweets,
    refreshTimeline,
    tweets,
    loadMoreRef,
    ...query,
  }
}
