import { useMutation, useQueryClient } from '@tanstack/react-query'

import { likeTweet } from '@/api/tweets/tweets-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import {
  restoreTweetCaches,
  snapshotTweetCaches,
  updateTweetInCaches,
} from '@/hooks/tweets/update-tweet-cache'

export function useLikeTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: likeTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      const snapshot = snapshotTweetCaches(queryClient)

      updateTweetInCaches(queryClient, tweetId, (tweet) => ({
        ...tweet,
        likedByMe: true,
        likesCount: tweet.likesCount + 1,
      }))

      return { snapshot }
    },
    onSuccess: (updatedTweet) => {
      updateTweetInCaches(queryClient, updatedTweet.id, () => updatedTweet)
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: (_error, _tweetId, context) => {
      if (context?.snapshot) {
        restoreTweetCaches(queryClient, context.snapshot)
      }
    },
  })
}
