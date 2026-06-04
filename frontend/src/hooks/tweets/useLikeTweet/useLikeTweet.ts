import { useMutation, useQueryClient } from '@tanstack/react-query'

import { likeTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import { updateTweetInCaches } from '@/hooks/tweets/update-tweet-cache'

export function useLikeTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['like-tweet'],
    mutationFn: likeTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      updateTweetInCaches(queryClient, tweetId, (tweet) => ({
        ...tweet,
        likedByMe: true,
        likesCount: tweet.likesCount + 1,
      }))
    },
    onSuccess: (updatedTweet) => {
      updateTweetInCaches(queryClient, updatedTweet.id, () => updatedTweet)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
      queryClient.invalidateQueries({ queryKey: tweetKeys.all })
    },
  })
}
