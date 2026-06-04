import { Navigate } from 'react-router-dom'

import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

export function ProfileRedirectPage() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return null
  }

  return <Navigate to={paths.profile(user.username)} replace />
}
