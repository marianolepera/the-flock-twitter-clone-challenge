import { useQuery } from '@tanstack/react-query'

import { getProfile } from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'

export function useGetProfile(username: string) {
  return useQuery({
    queryKey: userKeys.profile(username),
    queryFn: () => getProfile(username),
    enabled: Boolean(username),
  })
}
