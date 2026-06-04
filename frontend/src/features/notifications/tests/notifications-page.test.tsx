import '@/features/notifications/tests/mock-notifications-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { markAllNotificationsRead } from '@/api/notifications/notifications-api'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

describe('NotificationsPage', () => {
  it('marks all notifications as read on mount', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(<NotificationsPage />, {
      route: paths.notifications,
      formPath: paths.notifications,
    })

    await waitFor(() => {
      expect(markAllNotificationsRead).toHaveBeenCalled()
    })

    expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: /@alice liked your tweet/i }),
    ).toBeInTheDocument()
  })

  it('marks all as read when the header button is clicked', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    const user = userEvent.setup()

    vi.mocked(markAllNotificationsRead).mockClear()

    renderWithProviders(<NotificationsPage />, {
      route: paths.notifications,
      formPath: paths.notifications,
    })

    await waitFor(() => {
      expect(markAllNotificationsRead).toHaveBeenCalledTimes(1)
    })

    await user.click(
      screen.getByRole('button', { name: /mark all as read/i }),
    )

    await waitFor(() => {
      expect(markAllNotificationsRead).toHaveBeenCalledTimes(2)
    })
  })
})
