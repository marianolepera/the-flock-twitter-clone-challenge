import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import { removeTweetFromCaches } from '@/hooks/tweets/update-tweet-cache'

export function useDeleteTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['delete-tweet'],
    mutationFn: deleteTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      removeTweetFromCaches(queryClient, tweetId)

      return { tweetId }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
      queryClient.invalidateQueries({ queryKey: tweetKeys.all })
    },
  })
}
