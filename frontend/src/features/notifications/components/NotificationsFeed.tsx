import { useEffect, useRef } from 'react'

import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useGetNotifications } from '@/hooks/notifications/useGetNotifications/useGetNotifications'
import { formatApiError } from '@/lib/format-api-error'

export function NotificationsFeed() {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetNotifications()

  const notifications = data?.pages.flatMap((page) => page.items) ?? []

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" label="Loading notifications" />
      </div>
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

      <div ref={loadMoreRef} className="flex justify-center py-6" aria-hidden>
        {isFetchingNextPage ? (
          <Spinner size="md" label="Loading more notifications" />
        ) : null}
      </div>
    </section>
  )
}
