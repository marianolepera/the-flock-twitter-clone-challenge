import { Search } from 'lucide-react'

import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { UserCard } from '@/features/users/components/UserCard'
import {
  MIN_SEARCH_QUERY_LENGTH,
  useSearchUsers,
} from '@/hooks/users/useSearchUsers/useSearchUsers'
import { formatApiError } from '@/lib/format-api-error'

export interface UserSearchResultsProps {
  query: string
}

export function UserSearchResults({ query }: UserSearchResultsProps) {
  const trimmedQuery = query.trim()
  const { data: users, isLoading, isFetching, isError, error } =
    useSearchUsers(query)

  if (trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-sm text-muted">
          {trimmedQuery.length === 0
            ? 'Search for people by username or email.'
            : `Type at least ${MIN_SEARCH_QUERY_LENGTH} characters to search.`}
        </p>
      </div>
    )
  }

  if (isLoading || (isFetching && !users)) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" label="Searching users" />
      </div>
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
