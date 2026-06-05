import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useFollowButton } from '@/features/users/hooks/useFollowButton'

export interface FollowButtonProps {
  username: string
  isFollowing: boolean
  isStatusLoading?: boolean
}

export function FollowButton({
  username,
  isFollowing,
  isStatusLoading = false,
}: FollowButtonProps) {
  const { isFollowing: isFollowingState, isPendingForUser, handleClick } =
    useFollowButton({ username, isFollowing, isStatusLoading })

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
      variant={isFollowingState ? 'outline' : 'primary'}
      size="sm"
      pill
      className="min-w-24 cursor-pointer"
      aria-pressed={isFollowingState}
      aria-busy={isPendingForUser}
      aria-label={
        isFollowingState ? `Unfollow @${username}` : `Follow @${username}`
      }
      onClick={handleClick}
    >
      {isPendingForUser ? (
        <Spinner
          size="sm"
          label={isFollowingState ? 'Unfollowing' : 'Following'}
        />
      ) : isFollowingState ? (
        'Following'
      ) : (
        'Follow'
      )}
    </Button>
  )
}
