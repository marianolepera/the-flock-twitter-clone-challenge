import { useMutation, useQueryClient } from '@tanstack/react-query'

import { unfollowUser } from '@/api/users/users-api'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { userKeys } from '@/hooks/users/query-keys'
import { useAuthStore } from '@/stores/auth.store'

export function useUnfollowUser() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_data, username) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.all })

      if (currentUser) {
        queryClient.invalidateQueries({
          queryKey: userKeys.following(currentUser.username),
        })
      }

      queryClient.invalidateQueries({ queryKey: userKeys.followers(username) })
    },
  })
}
