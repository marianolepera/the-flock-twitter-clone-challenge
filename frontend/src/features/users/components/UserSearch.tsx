import { Search } from 'lucide-react'

import { Input } from '@/components/atoms/Input'
import { FeedSkeletonList } from '@/components/molecules/FeedSkeletonList'
import { UserCard } from '@/features/users/components/UserCard'
import { UserCardSkeleton } from '@/features/users/components/UserCardSkeleton'
import { useUserSearchResults } from '@/features/users/hooks/useUserSearchResults'
import { formatApiError } from '@/lib/format-api-error'

export interface UserSearchResultsProps {
  query: string
}

export function UserSearchResults({ query }: UserSearchResultsProps) {
  const {
    trimmedQuery,
    users,
    isLoading,
    isFetching,
    isError,
    error,
    minQueryLength,
  } = useUserSearchResults(query)

  if (trimmedQuery.length < minQueryLength) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted">
          {trimmedQuery.length === 0
            ? 'Search for people by username or email.'
            : `Type at least ${minQueryLength} characters to search.`}
        </p>
      </div>
    )
  }

  if (isLoading || (isFetching && !users)) {
    return (
      <FeedSkeletonList
        label="Searching users"
        count={4}
        renderItem={() => <UserCardSkeleton />}
      />
    )
  }

  if (isError) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-danger" role="alert">
          {formatApiError(error, 'Could not search users')}
        </p>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted">
          No users found for &quot;{trimmedQuery}&quot;.
        </p>
      </div>
    )
  }

  return (
    <section aria-label="Search results">
      <ul className="list-none">
        {users.map((user) => (
          <li key={user.id}>
            <UserCard user={user} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export interface UserSearchFormProps {
  value: string
  onChange: (value: string) => void
}

export function UserSearchForm({ value, onChange }: UserSearchFormProps) {
  return (
    <div className="border-b border-border px-4 py-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-subtle"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          placeholder="Search users"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-10"
          aria-label="Search users"
        />
      </div>
    </div>
  )
}
