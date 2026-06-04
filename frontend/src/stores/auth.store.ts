import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthTokens, User } from '@/types/api.types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  setSession: (payload: AuthTokens & { user: User }) => void
  setTokens: (tokens: AuthTokens) => void
  updateUser: (user: User) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),
      updateUser: (user) => set({ user }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'the-flock-auth' },
  ),
)

export function selectIsAuthenticated(state: AuthState) {
  return Boolean(state.accessToken)
}
