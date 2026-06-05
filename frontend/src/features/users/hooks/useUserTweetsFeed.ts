import { useGetUserTweets } from '@/hooks/tweets/useGetUserTweets/useGetUserTweets'
import { useLoadMoreOnScroll } from '@/hooks/useLoadMoreOnScroll/useLoadMoreOnScroll'
import { useAuthStore } from '@/stores/auth.store'

export function useUserTweetsFeed(username: string) {
  const currentUser = useAuthStore((s) => s.user)
  const query = useGetUserTweets(username)
  const tweets = query.data?.pages.flatMap((page) => page.items) ?? []

  const loadMoreRef = useLoadMoreOnScroll(
    Boolean(query.hasNextPage && !query.isFetchingNextPage),
    () => {
      void query.fetchNextPage()
    },
  )

  return {
    username,
    currentUser,
    tweets,
    loadMoreRef,
    ...query,
  }
}
