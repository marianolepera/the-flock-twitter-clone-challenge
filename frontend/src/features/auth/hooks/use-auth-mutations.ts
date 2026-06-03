import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { login, logout, register } from '@/features/auth/api/auth-api'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => setSession(data),
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: register,
    onSuccess: (data) => setSession(data),
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const navigate = useNavigate()

  return useMutation({
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
