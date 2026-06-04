import { useMutation } from '@tanstack/react-query'

import { login } from '@/api/auth/auth-api'
import { useAuthStore } from '@/stores/auth.store'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationKey: ['login'],
    mutationFn: login,
    onSuccess: (data) => setSession(data),
  })
}
