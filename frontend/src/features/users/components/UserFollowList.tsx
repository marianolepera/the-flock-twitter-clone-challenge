import { useEffect, useRef } from 'react'

import { Button } from '@/components/atoms/Button'
import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { UserCard } from '@/features/users/components/UserCard'
import { UserCardSkeleton } from '@/features/users/components/UserCardSkeleton'
import { useGetFollowers } from '@/hooks/users/useGetFollowers/useGetFollowers'
import { useGetFollowingList } from '@/hooks/users/useGetFollowingList/useGetFollowingList'
import { formatApiError } from '@/lib/format-api-error'

export interface UserFollowListProps {
  username: string
  type: 'followers' | 'following'
}

export function UserFollowList({ username, type }: UserFollowListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const followersQuery = useGetFollowers(username, type === 'followers')
  const followingQuery = useGetFollowingList(username, type === 'following')

  const query = type === 'followers' ? followersQuery : followingQuery
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    query

  const users = data?.pages.flatMap((page) => page.items) ?? []
  const emptyLabel = type === 'followers' ? 'No followers yet' : 'Not following anyone yet'

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  if (isLoading) {
    return (
      <FeedSkeletonList
        label={type === 'followers' ? 'Loading followers' : 'Loading following'}
        renderItem={() => <UserCardSkeleton />}
      />
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-danger" role="alert">
          {formatApiError(error, `Could not load ${type}`)}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void refetch()}
        >
          Try again
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <section aria-label={type === 'followers' ? 'Followers' : 'Following'}>
      <ul className="list-none">
        {users.map((user) => (
          <li key={user.id}>
            <UserCard user={user} />
          </li>
        ))}
      </ul>

      <div ref={loadMoreRef} aria-hidden>
        {isFetchingNextPage ? <UserCardSkeleton /> : null}
        {hasNextPage && !isFetchingNextPage ? (
          <div className="flex justify-center py-6">
            <span className="text-sm text-subtle">Scroll for more</span>
          </div>
        ) : null}
      </div>
    </section>
  )
}
