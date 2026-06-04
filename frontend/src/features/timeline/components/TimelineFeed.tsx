import { useEffect, useRef } from 'react'

import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useTimelineUpdates } from '@/context/timeline-updates-context'
import { TweetCard } from '@/features/tweets/components/TweetCard'
import { useGetTimeline } from '@/hooks/timeline/useGetTimeline/useGetTimeline'
import { formatApiError } from '@/lib/format-api-error'
import { useAuthStore } from '@/stores/auth.store'

export function TimelineFeed() {
  const user = useAuthStore((s) => s.user)
  const { hasNewTweets, refreshTimeline } = useTimelineUpdates()
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
  } = useGetTimeline()

  const tweets = data?.pages.flatMap((page) => page.items) ?? []

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
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Loading timeline" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-danger" role="alert">
          {formatApiError(error, 'Could not load timeline')}
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

  if (tweets.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-lg font-bold text-foreground">Your timeline is empty</p>
        <p className="mt-2 text-sm text-muted">
          Follow people to see their tweets here, or post your first tweet above.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Timeline">
      {hasNewTweets ? (
        <div className="sticky top-0 z-10 border-b border-border bg-brand-muted px-4 py-2 text-center">
          <button
            type="button"
            className="cursor-pointer text-sm font-bold text-brand hover:underline"
            onClick={refreshTimeline}
          >
            New tweets — Show them
          </button>
        </div>
      ) : null}

      <ul className="list-none">
        {tweets.map((tweet) => (
          <li key={tweet.id}>
            <TweetCard tweet={tweet} currentUserId={user?.id} />
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} className="flex justify-center py-6" aria-hidden>
        {isFetchingNextPage ? (
          <Spinner size="md" label="Loading more tweets" />
        ) : hasNextPage ? (
          <span className="text-sm text-subtle">Scroll for more</span>
        ) : (
          <span className="text-sm text-subtle">You&apos;re all caught up</span>
        )}
      </div>
    </section>
  )
}
