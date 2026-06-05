import { Avatar } from '@/components/atoms/Avatar'
import { EditProfileBio } from '@/features/users/components/EditProfileBio'
import { FollowButton } from '@/features/users/components/FollowButton'
import { useProfileHeader } from '@/features/users/hooks/useProfileHeader'
import { cn } from '@/lib/cn'
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
  const {
    isSelf,
    isFollowing,
    isFollowingLoading,
    followersCount,
    followingCount,
    tweetsCount,
  } = useProfileHeader(user)

  return (
    <header className="border-b border-border px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar
            src={user.avatarUrl}
            alt={user.username}
            email={user.email}
            size="xl"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-foreground">
              @{user.username}
            </h1>
            {isSelf ? (
              <EditProfileBio user={user} />
            ) : user.bio ? (
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
