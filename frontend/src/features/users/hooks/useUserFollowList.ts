import { useGetFollowers } from '@/hooks/users/useGetFollowers/useGetFollowers'
import { useGetFollowingList } from '@/hooks/users/useGetFollowingList/useGetFollowingList'
import { useLoadMoreOnScroll } from '@/hooks/useLoadMoreOnScroll/useLoadMoreOnScroll'

export function useUserFollowList(
  username: string,
  type: 'followers' | 'following',
) {
  const followersQuery = useGetFollowers(username, type === 'followers')
  const followingQuery = useGetFollowingList(username, type === 'following')
  const query = type === 'followers' ? followersQuery : followingQuery

  const users = query.data?.pages.flatMap((page) => page.items) ?? []
  const emptyLabel =
    type === 'followers' ? 'No followers yet' : 'Not following anyone yet'

  const loadMoreRef = useLoadMoreOnScroll(
    Boolean(query.hasNextPage && !query.isFetchingNextPage),
    () => {
      void query.fetchNextPage()
    },
  )

  return {
    type,
    users,
    emptyLabel,
    loadMoreRef,
    ...query,
  }
}
