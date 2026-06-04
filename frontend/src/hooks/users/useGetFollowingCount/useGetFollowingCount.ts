import { useQuery } from '@tanstack/react-query'

import { getFollowing } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'

export function useGetFollowingCount(username: string) {
  return useQuery({
    queryKey: [...userKeys.following(username), 'count'] as const,
    queryFn: () => getFollowing(username, { page: 1, limit: 1 }),
    enabled: Boolean(username),
    select: (data) => data.total,
  })
}
