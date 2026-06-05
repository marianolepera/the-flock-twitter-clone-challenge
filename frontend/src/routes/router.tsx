import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/layouts/AppLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RequireAuth } from '@/layouts/RequireAuth'
import { RequireGuest } from '@/layouts/RequireGuest'
import { HomePage } from '@/pages/HomePage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfileRedirectPage } from '@/pages/ProfileRedirectPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SearchPage } from '@/pages/SearchPage'
import { TweetThreadPage } from '@/pages/TweetThreadPage'
import { UserProfilePage } from '@/pages/UserProfilePage'
import { paths } from '@/routes/paths'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: paths.landing, element: <LandingPage /> },
          { path: paths.login, element: <LoginPage /> },
          { path: paths.register, element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: paths.home, element: <HomePage /> },
          { path: '/tweets/:tweetId', element: <TweetThreadPage /> },
          { path: paths.notifications, element: <NotificationsPage /> },
          { path: paths.search, element: <SearchPage /> },
          { path: paths.profileMe, element: <ProfileRedirectPage /> },
          { path: '/:username', element: <UserProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
