import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTweet } from '@/api/tweets/tweets-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import {
  removeTweetFromCaches,
  restoreTweetCaches,
  snapshotTweetCaches,
} from '@/hooks/tweets/update-tweet-cache'
import { useSnackbarStore } from '@/stores/snackbar.store'

export function useDeleteTweet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTweet,
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey: timelineKeys.all })
      await queryClient.cancelQueries({ queryKey: tweetKeys.all })

      const snapshot = snapshotTweetCaches(queryClient)
      removeTweetFromCaches(queryClient, tweetId)

      return { snapshot, tweetId }
    },
    onSuccess: (_data, tweetId) => {
      queryClient.removeQueries({ queryKey: tweetKeys.thread(tweetId) })
      useSnackbarStore.getState().show('Tweet deleted')
    },
    onError: (_error, _tweetId, context) => {
      if (context?.snapshot) {
        restoreTweetCaches(queryClient, context.snapshot)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })
      queryClient.invalidateQueries({ queryKey: tweetKeys.all })
    },
  })
}
