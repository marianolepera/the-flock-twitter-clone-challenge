import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { paths } from '@/routes/paths'


export function RequireAuth() {
  const location = useLocation()
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
