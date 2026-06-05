import { useState } from 'react'

import { useFollowUser } from '@/hooks/users/useFollowUser/useFollowUser'
import { useUnfollowUser } from '@/hooks/users/useUnfollowUser/useUnfollowUser'

export interface UseFollowButtonOptions {
  username: string
  isFollowing: boolean
  isStatusLoading?: boolean
}

export function useFollowButton({
  username,
  isFollowing: isFollowingProp,
  isStatusLoading = false,
}: UseFollowButtonOptions) {
  const followMutation = useFollowUser()
  const unfollowMutation = useUnfollowUser()

  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(
    null,
  )

  const isFollowing = optimisticFollowing ?? isFollowingProp

  const isPendingForUser =
    (followMutation.isPending && followMutation.variables === username) ||
    (unfollowMutation.isPending && unfollowMutation.variables === username)

  function handleClick() {
    if (isPendingForUser || isStatusLoading) return

    const nextIsFollowing = !isFollowing
    setOptimisticFollowing(nextIsFollowing)

    const mutation = nextIsFollowing ? followMutation : unfollowMutation

    mutation.mutate(username, {
      onSettled: () => setOptimisticFollowing(null),
      onError: () => setOptimisticFollowing(null),
    })
  }

  return {
    isFollowing,
    isPendingForUser,
    isStatusLoading,
    handleClick,
  }
}
