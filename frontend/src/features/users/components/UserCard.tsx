import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { FollowButton } from '@/features/users/components/FollowButton'
import { useIsFollowing } from '@/hooks/users/useIsFollowing/useIsFollowing'
import { paths } from '@/routes/paths'
import type { User } from '@/types/api.types'

export interface UserCardProps {
  user: User
  showFollowButton?: boolean
}

export function UserCard({ user, showFollowButton = true }: UserCardProps) {
  const { isFollowing, isLoading, isSelf } = useIsFollowing(user.username)

  return (
    <article className="flex items-start gap-3 border-b border-border px-4 py-3">
      <Link
        to={paths.profile(user.username)}
        className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <Avatar src={user.avatarUrl} alt={user.username} size="md" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          to={paths.profile(user.username)}
          className="font-bold text-foreground hover:underline"
        >
          @{user.username}
        </Link>
        {user.bio ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{user.bio}</p>
        ) : null}
      </div>

      {showFollowButton && !isSelf ? (
        <FollowButton
          username={user.username}
          isFollowing={isFollowing}
          isStatusLoading={isLoading}
        />
      ) : null}
    </article>
  )
}
