import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'

export function useCreateTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-tweet'],
    mutationFn: createTweet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
    },
  })
}
