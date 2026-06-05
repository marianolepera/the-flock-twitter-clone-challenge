import { Navigate } from 'react-router-dom'

import { paths } from '@/routes/paths'

import { useProfileRedirectPage } from './hooks/useProfileRedirectPage'

export function ProfileRedirectPage() {
  const { username } = useProfileRedirectPage()

  if (!username) {
    return null
  }

  return <Navigate to={paths.profile(username)} replace />
}
