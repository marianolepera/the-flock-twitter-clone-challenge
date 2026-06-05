import { Button } from '@/components/atoms/Button'
import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { TweetCard } from '@/features/tweets/components/TweetCard'
import { TweetCardSkeleton } from '@/features/tweets/components/TweetCardSkeleton'
import { useUserTweetsFeed } from '@/features/users/hooks/useUserTweetsFeed'
import { formatApiError } from '@/lib/format-api-error'

export interface UserTweetsFeedProps {
  username: string
}

export function UserTweetsFeed({ username }: UserTweetsFeedProps) {
  const {
    currentUser,
    tweets,
    loadMoreRef,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
  } = useUserTweetsFeed(username)

  if (isLoading) {
    return (
      <FeedSkeletonList
        label={`Loading tweets by @${username}`}
        renderItem={() => <TweetCardSkeleton />}
      />
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-danger" role="alert">
          {formatApiError(error, 'Could not load tweets')}
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
        <p className="text-lg font-bold text-foreground">No tweets yet</p>
        <p className="mt-2 text-sm text-muted">
          @{username} hasn&apos;t posted anything.
        </p>
      </div>
    )
  }

  return (
    <section aria-label={`Tweets by @${username}`}>
      <ul className="list-none">
        {tweets.map((tweet) => (
          <li key={tweet.id}>
            <TweetCard tweet={tweet} currentUserId={currentUser?.id} />
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} aria-hidden>
        {isFetchingNextPage ? <TweetCardSkeleton /> : null}
        {hasNextPage && !isFetchingNextPage ? (
          <div className="flex justify-center py-6">
            <span className="text-sm text-subtle">Scroll for more</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
