import { useQuery } from '@tanstack/react-query'

import { searchUsers } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'

export const MIN_SEARCH_QUERY_LENGTH = 3

const DEFAULT_LIMIT = 20

export function useSearchUsers(query: string) {
  const trimmedQuery = query.trim()

  return useQuery({
    queryKey: userKeys.search(trimmedQuery),
    queryFn: () => searchUsers({ q: trimmedQuery, limit: DEFAULT_LIMIT }),
    enabled: trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH,
  })
}
