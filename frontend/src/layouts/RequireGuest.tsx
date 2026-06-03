import { Navigate, Outlet } from 'react-router-dom'

import { Spinner } from '@/components/atoms/Spinner'
import { useAuthHydrated } from '@/hooks/use-auth-hydrated'
import { paths } from '@/routes/paths'
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth.store'

export function RequireGuest() {
  const hydrated = useAuthHydrated()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  if (!hydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />
  }

  return <Outlet />
}
