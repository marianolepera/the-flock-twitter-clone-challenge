import { useDeleteTweet } from '@/hooks/tweets/useDeleteTweet/useDeleteTweet'
import { useLikeTweet } from '@/hooks/tweets/useLikeTweet/useLikeTweet'
import { useUnlikeTweet } from '@/hooks/tweets/useUnlikeTweet/useUnlikeTweet'
import type { Tweet } from '@/types/api.types'

export interface UseTweetCardActionsOptions {
  tweet: Tweet
  onDeleted?: () => void
}

export function useTweetCardActions({
  tweet,
  onDeleted,
}: UseTweetCardActionsOptions) {
  const likeMutation = useLikeTweet()
  const unlikeMutation = useUnlikeTweet()
  const deleteMutation = useDeleteTweet()

  const isLikePendingForTweet =
    (likeMutation.isPending && likeMutation.variables === tweet.id) ||
    (unlikeMutation.isPending && unlikeMutation.variables === tweet.id)
  const isDeletePendingForTweet =
    deleteMutation.isPending && deleteMutation.variables === tweet.id

  function handleLikeToggle() {
    if (isLikePendingForTweet) return

    if (tweet.likedByMe) {
      unlikeMutation.mutate(tweet.id)
      return
    }

    likeMutation.mutate(tweet.id)
  }

  function handleDelete() {
    if (isDeletePendingForTweet) return

    deleteMutation.mutate(tweet.id, {
      onSuccess: () => {
        onDeleted?.()
      },
    })
  }

  return {
    isLikePendingForTweet,
    isDeletePendingForTweet,
    handleLikeToggle,
    handleDelete,
  }
}
