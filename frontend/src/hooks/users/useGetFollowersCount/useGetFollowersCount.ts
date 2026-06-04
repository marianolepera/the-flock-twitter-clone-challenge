import { useQuery } from '@tanstack/react-query'

import { getFollowers } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'

export function useGetFollowersCount(username: string) {
  return useQuery({
    queryKey: [...userKeys.followers(username), 'count'] as const,
    queryFn: () => getFollowers(username, { page: 1, limit: 1 }),
    enabled: Boolean(username),
    select: (data) => data.total,
  })
}
