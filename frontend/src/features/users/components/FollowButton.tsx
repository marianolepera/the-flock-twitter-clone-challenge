import { useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useFollowUser } from '@/hooks/users/useFollowUser/useFollowUser'
import { useUnfollowUser } from '@/hooks/users/useUnfollowUser/useUnfollowUser'

export interface FollowButtonProps {
  username: string
  isFollowing: boolean
  isStatusLoading?: boolean
}

export function FollowButton({
  username,
  isFollowing: isFollowingProp,
  isStatusLoading = false,
}: FollowButtonProps) {
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

  if (isStatusLoading) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        pill
        disabled
        className="min-w-24"
        aria-label={`Loading follow status for @${username}`}
      >
        <Spinner size="sm" label="Loading follow status" />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={isFollowing ? 'outline' : 'primary'}
      size="sm"
      pill
      className="min-w-24 cursor-pointer"
      aria-pressed={isFollowing}
      aria-busy={isPendingForUser}
      aria-label={
        isFollowing ? `Unfollow @${username}` : `Follow @${username}`
      }
      onClick={handleClick}
    >
      {isPendingForUser ? (
        <Spinner size="sm" label={isFollowing ? 'Unfollowing' : 'Following'} />
      ) : isFollowing ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  )
}
