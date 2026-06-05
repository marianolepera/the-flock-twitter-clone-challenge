import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTweet, type CreateTweetPayload } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'

export function useCreateTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTweet,
    onSuccess: (_data, variables: CreateTweetPayload) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
      queryClient.invalidateQueries({ queryKey: tweetKeys.all })

      if (variables.parentTweetId) {
        queryClient.invalidateQueries({
          queryKey: tweetKeys.thread(variables.parentTweetId),
        })
      }
    },
  })
}
