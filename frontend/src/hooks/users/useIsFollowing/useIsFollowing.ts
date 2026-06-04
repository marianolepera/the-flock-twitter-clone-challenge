import { useQuery } from '@tanstack/react-query'

import { getFollowing } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'
import { useAuthStore } from '@/stores/auth.store'

const FOLLOWING_LOOKUP_LIMIT = 50

export function useIsFollowing(targetUsername: string) {
  const currentUser = useAuthStore((s) => s.user)
  const isSelf = currentUser?.username === targetUsername

  const { data, isLoading } = useQuery({
    queryKey: userKeys.following(currentUser?.username ?? ''),
    queryFn: () =>
      getFollowing(currentUser!.username, { limit: FOLLOWING_LOOKUP_LIMIT }),
    enabled: Boolean(currentUser) && !isSelf,
  })

  const isFollowing =
    !isSelf &&
    (data?.items.some((user) => user.username === targetUsername) ?? false)

  return {
    isFollowing,
    isLoading: !isSelf && isLoading,
    isSelf,
  }
}
