import { useGetNotifications } from '@/hooks/notifications/useGetNotifications/useGetNotifications'
import { useLoadMoreOnScroll } from '@/hooks/useLoadMoreOnScroll/useLoadMoreOnScroll'

export function useNotificationsFeed() {
  const query = useGetNotifications()
  const notifications = query.data?.pages.flatMap((page) => page.items) ?? []

  const loadMoreRef = useLoadMoreOnScroll(
    Boolean(query.hasNextPage && !query.isFetchingNextPage),
    () => {
      void query.fetchNextPage()
    },
  )

  return {
    notifications,
    loadMoreRef,
    ...query,
  }
}
