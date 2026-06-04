import { useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import {
  ProfileHeader,
  type ProfileTab,
} from '@/features/users/components/ProfileHeader'
import { UserFollowList } from '@/features/users/components/UserFollowList'
import { UserTweetsFeed } from '@/features/users/components/UserTweetsFeed'
import { useGetProfile } from '@/hooks/users/useGetProfile/useGetProfile'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

export function UserProfilePage() {
  const { username = '' } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState<ProfileTab>('tweets')

  const { data: profile, isLoading, isError, error, refetch } =
    useGetProfile(username)

  const isNotFound = isAxiosError(error) && error.response?.status === 404

  return (
    <>
      <header className="sticky top-[57px] z-10 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="truncate text-xl font-bold">
          {username ? `@${username}` : 'Profile'}
        </h1>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" label="Loading profile" />
        </div>
      ) : null}

      {isError ? (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-danger" role="alert">
            {isNotFound
              ? 'User not found'
              : formatApiError(error, 'Could not load profile')}
          </p>
          {isNotFound ? (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to={paths.home}>Back to home</Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          )}
        </div>
      ) : null}

      {profile ? (
        <>
          <ProfileHeader
            user={profile}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'tweets' ? (
            <UserTweetsFeed username={profile.username} />
          ) : null}

          {activeTab === 'followers' ? (
            <UserFollowList username={profile.username} type="followers" />
          ) : null}

          {activeTab === 'following' ? (
            <UserFollowList username={profile.username} type="following" />
          ) : null}
        </>
      ) : null}
    </>
  )
}
