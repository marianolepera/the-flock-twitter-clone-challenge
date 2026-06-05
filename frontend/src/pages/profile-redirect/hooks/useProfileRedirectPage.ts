import { useAuthStore } from '@/stores/auth.store'

export function useProfileRedirectPage() {
  const user = useAuthStore((s) => s.user)

  return { username: user?.username ?? null }
}
