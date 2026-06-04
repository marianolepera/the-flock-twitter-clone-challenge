import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  updateProfile,
  type UpdateProfilePayload,
} from '@/api/users/users-api'
import { userKeys } from '@/hooks/users/query-keys'
import { useAuthStore } from '@/stores/auth.store'

interface UpdateProfileVariables {
  username: string
  payload: UpdateProfilePayload
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const updateUser = useAuthStore((s) => s.updateUser)

  return useMutation({
    mutationFn: ({ username, payload }: UpdateProfileVariables) =>
      updateProfile(username, payload),
    onSuccess: (updatedUser, { username }) => {
      updateUser(updatedUser)
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(updatedUser.username),
      })

      if (updatedUser.username !== username) {
        queryClient.invalidateQueries({ queryKey: userKeys.profile(username) })
      }
    },
  })
}
