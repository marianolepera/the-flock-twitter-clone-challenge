import { Avatar } from '@/components/atoms/Avatar'
import { FollowButton } from '@/features/users/components/FollowButton'
import { useGetFollowersCount } from '@/hooks/users/useGetFollowersCount/useGetFollowersCount'
import { useGetFollowingCount } from '@/hooks/users/useGetFollowingCount/useGetFollowingCount'
import { useGetUserTweetsCount } from '@/hooks/tweets/useGetUserTweetsCount/useGetUserTweetsCount'
import { useIsFollowing } from '@/hooks/users/useIsFollowing/useIsFollowing'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/types/api.types'

export type ProfileTab = 'tweets' | 'followers' | 'following'

export interface ProfileHeaderProps {
  user: User
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

function ProfileStat({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-pointer rounded-lg px-2 py-1 text-left transition-colors',
        'hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        isActive && 'bg-surface',
      )}
      aria-current={isActive ? 'true' : undefined}
    >
      <span className="block font-bold text-foreground">{count}</span>
      <span className="text-sm text-muted">{label}</span>
    </button>
  )
}

export function ProfileHeader({
  user,
  activeTab,
  onTabChange,
}: ProfileHeaderProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isSelf = currentUser?.id === user.id

  const { isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    user.username,
  )
  const { data: followersCount = 0 } = useGetFollowersCount(user.username)
  const { data: followingCount = 0 } = useGetFollowingCount(user.username)
  const { data: tweetsCount = 0 } = useGetUserTweetsCount(user.username)

  return (
    <header className="border-b border-border px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar src={user.avatarUrl} alt={user.username} size="xl" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground">
              @{user.username}
            </h1>
            {user.bio ? (
              <p className="mt-2 text-sm text-foreground">{user.bio}</p>
            ) : (
              <p className="mt-2 text-sm text-subtle">No bio yet.</p>
            )}
          </div>
        </div>

        {!isSelf ? (
          <FollowButton
            username={user.username}
            isFollowing={isFollowing}
            isStatusLoading={isFollowingLoading}
          />
        ) : null}
      </div>

      <div className="mt-4 flex gap-4">
        <ProfileStat
          label="Tweets"
          count={tweetsCount}
          isActive={activeTab === 'tweets'}
          onClick={() => onTabChange('tweets')}
        />
        <ProfileStat
          label="Following"
          count={followingCount}
          isActive={activeTab === 'following'}
          onClick={() => onTabChange('following')}
        />
        <ProfileStat
          label="Followers"
          count={followersCount}
          isActive={activeTab === 'followers'}
          onClick={() => onTabChange('followers')}
        />
      </div>
    </header>
  )
}
