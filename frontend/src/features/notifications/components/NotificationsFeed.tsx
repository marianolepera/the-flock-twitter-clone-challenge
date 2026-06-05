import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { NotificationItemSkeleton } from '@/features/notifications/components/NotificationItemSkeleton'
import { useNotificationsFeed } from '@/features/notifications/hooks/useNotificationsFeed'
import { Button } from '@/components/atoms/Button'
import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { formatApiError } from '@/lib/format-api-error'

export function NotificationsFeed() {
  const {
    notifications,
    loadMoreRef,
    isLoading,
    isError,
    error,
    refetch,
    isFetchingNextPage,
  } = useNotificationsFeed()

  if (isLoading) {
    return (
      <FeedSkeletonList
        label="Loading notifications"
        count={6}
        renderItem={() => <NotificationItemSkeleton />}
      />
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-danger" role="alert">
          {formatApiError(error, 'Could not load notifications')}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-xl font-bold text-foreground">Nothing here — yet</p>
        <p className="mt-2 text-sm text-muted">
          When someone follows you or likes your tweet, you&apos;ll see it here.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Notifications">
      <ul className="list-none">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationItem notification={notification} />
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} className="min-h-px" aria-hidden>
        {isFetchingNextPage ? <NotificationItemSkeleton /> : null}
      </div>
    </section>
  )
}
