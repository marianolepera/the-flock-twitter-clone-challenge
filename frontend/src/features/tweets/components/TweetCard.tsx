import { Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { useDeleteTweet } from '@/hooks/tweets/useDeleteTweet/useDeleteTweet'
import { useLikeTweet } from '@/hooks/tweets/useLikeTweet/useLikeTweet'
import { useUnlikeTweet } from '@/hooks/tweets/useUnlikeTweet/useUnlikeTweet'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { cn } from '@/lib/cn'
import { paths } from '@/routes/paths'
import type { Tweet } from '@/types/api.types'

export interface TweetCardProps {
  tweet: Tweet
  currentUserId?: string
}

export function TweetCard({ tweet, currentUserId }: TweetCardProps) {
  const likeMutation = useLikeTweet()
  const unlikeMutation = useUnlikeTweet()
  const deleteMutation = useDeleteTweet()

  const isOwn = currentUserId === tweet.authorId
  const isLikePending = likeMutation.isPending || unlikeMutation.isPending
  const isDeletePending = deleteMutation.isPending

  function handleLikeToggle() {
    if (tweet.likedByMe) {
      unlikeMutation.mutate(tweet.id)
      return
    }

    likeMutation.mutate(tweet.id)
  }

  function handleDelete() {
    deleteMutation.mutate(tweet.id)
  }

  return (
    <article className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Link
          to={paths.profile(tweet.author.username)}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <Avatar
            src={tweet.author.avatarUrl}
            alt={tweet.author.username}
            size="md"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-sm">
            <Link
              to={paths.profile(tweet.author.username)}
              className="truncate font-bold text-foreground hover:underline"
            >
              @{tweet.author.username}
            </Link>
            <span className="text-subtle" aria-hidden>
              ·
            </span>
            <time
              dateTime={tweet.createdAt}
              className="text-subtle"
              title={new Date(tweet.createdAt).toLocaleString()}
            >
              {formatRelativeTime(tweet.createdAt)}
            </time>
          </header>

          <p className="mt-1 whitespace-pre-wrap break-words text-foreground">
            {tweet.content}
          </p>

          <footer className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleLikeToggle}
              disabled={isLikePending || isDeletePending}
              aria-pressed={tweet.likedByMe}
              aria-label={
                tweet.likedByMe
                  ? `Unlike tweet (${tweet.likesCount} likes)`
                  : `Like tweet (${tweet.likesCount} likes)`
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm transition-colors',
                'hover:bg-danger-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                'disabled:cursor-not-allowed disabled:opacity-50',
                tweet.likedByMe ? 'text-like' : 'text-muted hover:text-like',
              )}
            >
              <Heart
                className={cn('size-4', tweet.likedByMe && 'fill-current')}
                aria-hidden
              />
              <span>{tweet.likesCount}</span>
            </button>

            {isOwn ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDeletePending || isLikePending}
                onClick={handleDelete}
                className="text-muted hover:text-danger"
                aria-label="Delete tweet"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            ) : null}
          </footer>
        </div>
      </div>
    </article>
  )
}
