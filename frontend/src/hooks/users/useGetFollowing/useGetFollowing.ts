import { useQuery } from '@tanstack/react-query'

import { getFollowing, type PaginationParams } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'

export function useGetFollowing(
  username: string,
  params: PaginationParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...userKeys.following(username), params] as const,
    queryFn: () => getFollowing(username, params),
    enabled: options?.enabled ?? Boolean(username),
  })
}
