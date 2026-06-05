import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { ComposeTweet } from '@/features/tweets/components/ComposeTweet'
import { TweetCard } from '@/features/tweets/components/TweetCard'
import { TweetCardSkeleton } from '@/features/tweets/components/TweetCardSkeleton'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

import { useTweetThreadPage } from './hooks/useTweetThreadPage'

export function TweetThreadPage() {
  const {
    currentUser,
    data,
    isLoading,
    isError,
    error,
    showThread,
    threadMissing,
    handleTweetDeleted,
    handleTweetNotFound,
  } = useTweetThreadPage()

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md">
        <Link
          to={paths.home}
          className="rounded-full p-2 text-foreground transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label="Back to home"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <h1 className="text-xl font-bold text-foreground">Thread</h1>
      </header>

      {isLoading ? (
        <FeedSkeletonList
          label="Loading thread"
          count={3}
          renderItem={() => <TweetCardSkeleton />}
        />
      ) : null}

      {isError && !threadMissing ? (
        <p className="px-4 py-6 text-sm text-danger" role="alert">
          {formatApiError(error, 'Could not load thread')}
        </p>
      ) : null}

      {showThread && data ? (
        <>
          <TweetCard
            tweet={data.root}
            currentUserId={currentUser?.id}
            showReplyButton={false}
            onDeleted={handleTweetDeleted}
          />

          {data.replies.length > 0 ? (
            <section aria-label="Replies">
              {data.replies.map((reply) => (
                <TweetCard
                  key={reply.id}
                  tweet={reply}
                  currentUserId={currentUser?.id}
                  showReplyButton={false}
                />
              ))}
            </section>
          ) : null}

          <ComposeTweet
            parentTweetId={data.root.id}
            placeholder="Post your reply"
            submitLabel="Reply"
            fieldId="compose-reply"
            onTweetNotFound={handleTweetNotFound}
          />
        </>
      ) : null}
    </div>
  )
}
