import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unlikeTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import {
  restoreTweetCaches,
  snapshotTweetCaches,
  updateTweetInCaches,
} from '@/hooks/tweets/update-tweet-cache'

export function useUnlikeTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unlikeTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      const snapshot = snapshotTweetCaches(queryClient)

      updateTweetInCaches(queryClient, tweetId, (tweet) => ({
        ...tweet,
        likedByMe: false,
        likesCount: Math.max(0, tweet.likesCount - 1),
      }))

      return { snapshot }
    },
    onError: (_error, _tweetId, context) => {
      if (context?.snapshot) {
        restoreTweetCaches(queryClient, context.snapshot)
      }
    },
  })
}
