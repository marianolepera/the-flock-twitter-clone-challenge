import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import { timelineKeys } from '@/hooks/timeline/query-keys'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import type {
  PaginatedResponse,
  TimelineFeedResponse,
  Tweet,
} from '@/types/api.types'

export function updateTweetInCaches(
  queryClient: QueryClient,
  tweetId: string,
  updater: (tweet: Tweet) => Tweet,
) {
  queryClient.setQueriesData<InfiniteData<TimelineFeedResponse>>(
    { queryKey: timelineKeys.all },
    (old) => {
      if (!old?.pages) return old

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((tweet) =>
            tweet.id === tweetId ? updater(tweet) : tweet,
          ),
        })),
      }
    },
  )

  queryClient.setQueriesData<PaginatedResponse<Tweet>>(
    { queryKey: tweetKeys.all },
    (old) => {
      if (!old?.items) return old

      return {
        ...old,
        items: old.items.map((tweet) =>
          tweet.id === tweetId ? updater(tweet) : tweet,
        ),
      }
    },
  )
}

export function removeTweetFromCaches(
  queryClient: QueryClient,
  tweetId: string,
) {
  queryClient.setQueriesData<InfiniteData<TimelineFeedResponse>>(
    { queryKey: timelineKeys.all },
    (old) => {
      if (!old?.pages) return old

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.filter((tweet) => tweet.id !== tweetId),
        })),
      }
    },
  )

  queryClient.setQueriesData<PaginatedResponse<Tweet>>(
    { queryKey: tweetKeys.all },
    (old) => {
      if (!old?.items) return old

      return {
        ...old,
        items: old.items.filter((tweet) => tweet.id !== tweetId),
        total: Math.max(0, old.total - 1),
      }
    },
  )
}
