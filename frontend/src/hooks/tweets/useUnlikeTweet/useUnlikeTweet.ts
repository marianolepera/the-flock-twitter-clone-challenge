import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unlikeTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import { updateTweetInCaches } from '@/hooks/tweets/update-tweet-cache'

export function useUnlikeTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['unlike-tweet'],
    mutationFn: unlikeTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      updateTweetInCaches(queryClient, tweetId, (tweet) => ({
        ...tweet,
        likedByMe: false,
        likesCount: Math.max(0, tweet.likesCount - 1),
      }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
      queryClient.invalidateQueries({ queryKey: tweetKeys.all })
    },
  })
}
