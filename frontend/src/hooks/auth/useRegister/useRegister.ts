import { useMutation } from '@tanstack/react-query'

import { register } from '@/api/auth/auth-api'
import { useAuthStore } from '@/stores/auth.store'

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationKey: ['register'],
    mutationFn: register,
    onSuccess: (data) => setSession(data),
  })
}
