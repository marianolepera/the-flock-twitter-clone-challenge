import {
  MIN_SEARCH_QUERY_LENGTH,
  useSearchUsers,
} from '@/hooks/users/useSearchUsers/useSearchUsers'

export function useUserSearchResults(query: string) {
  const trimmedQuery = query.trim()
  const { data: users, isLoading, isFetching, isError, error } =
    useSearchUsers(query)

  return {
    trimmedQuery,
    users,
    isLoading,
    isFetching,
    isError,
    error,
    minQueryLength: MIN_SEARCH_QUERY_LENGTH,
  }
}
