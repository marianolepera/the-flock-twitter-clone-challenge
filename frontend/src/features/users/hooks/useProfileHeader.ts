import { useGetFollowersCount } from '@/hooks/users/useGetFollowersCount/useGetFollowersCount'
import { useGetFollowingCount } from '@/hooks/users/useGetFollowingCount/useGetFollowingCount'
import { useGetUserTweetsCount } from '@/hooks/tweets/useGetUserTweetsCount/useGetUserTweetsCount'
import { useIsFollowing } from '@/hooks/users/useIsFollowing/useIsFollowing'
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/types/api.types'

export function useProfileHeader(user: User) {
  const currentUser = useAuthStore((s) => s.user)
  const isSelf = currentUser?.id === user.id

  const { isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    user.username,
  )
  const { data: followersCount = 0 } = useGetFollowersCount(user.username)
  const { data: followingCount = 0 } = useGetFollowingCount(user.username)
  const { data: tweetsCount = 0 } = useGetUserTweetsCount(user.username)

  return {
    isSelf,
    isFollowing,
    isFollowingLoading,
    followersCount,
    followingCount,
    tweetsCount,
  }
}
