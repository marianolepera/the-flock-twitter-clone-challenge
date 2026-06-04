import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { logout } from '@/api/auth/auth-api'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const navigate = useNavigate()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      if (refreshToken) {
        await logout(refreshToken)
      }
    },
    onSettled: () => {
      clearSession()
      navigate(paths.landing, { replace: true })
    },
  })
}
