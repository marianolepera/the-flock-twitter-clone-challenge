import { Button } from '@/components/atoms/Button'
import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { TweetCard } from '@/features/tweets/components/TweetCard'
import { TweetCardSkeleton } from '@/features/tweets/components/TweetCardSkeleton'
import { useTimelineFeed } from '@/features/timeline/hooks/useTimelineFeed'
import { formatApiError } from '@/lib/format-api-error'

export function TimelineFeed() {
  const {
    user,
    hasNewTweets,
    refreshTimeline,
    tweets,
    loadMoreRef,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  } = useTimelineFeed()

  if (isLoading) {
    return (
      <FeedSkeletonList
        label="Loading timeline"
        renderItem={() => <TweetCardSkeleton />}
      />
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
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-2 text-center">
          <button
            type="button"
            className="cursor-pointer text-sm font-bold text-foreground hover:underline"
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

      <div ref={loadMoreRef} aria-hidden>
        {isFetchingNextPage ? <TweetCardSkeleton /> : null}
        {isFetchingNextPage ? null : hasNextPage ? (
          <div className="flex justify-center py-6">
            <span className="text-sm text-subtle">Scroll for more</span>
          </div>
        ) : (
          <div className="flex justify-center py-6">
            <span className="text-sm text-subtle">You&apos;re all caught up</span>
          </div>
        )}
      </div>
    </section>
  )
}
