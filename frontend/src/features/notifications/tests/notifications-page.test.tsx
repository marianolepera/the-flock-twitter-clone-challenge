import '@/features/notifications/tests/mock-notifications-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  getUnreadNotificationCount,
  markAllNotificationsRead,
} from '@/api/notifications/notifications-api'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

describe('NotificationsPage', () => {
  it('does not mark notifications as read on mount', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(markAllNotificationsRead).mockClear()

    renderWithProviders(<NotificationsPage />, {
      route: paths.notifications,
      formPath: paths.notifications,
    })

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /@alice liked your tweet/i }),
      ).toBeInTheDocument()
    })

    expect(markAllNotificationsRead).not.toHaveBeenCalled()
    expect(
      screen.getByRole('button', { name: /mark all as read/i }),
    ).not.toBeDisabled()
  })

  it('marks all as read when the header button is clicked', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    const user = userEvent.setup()

    vi.mocked(markAllNotificationsRead).mockClear()
    vi.mocked(getUnreadNotificationCount).mockResolvedValue({ count: 2 })

    renderWithProviders(<NotificationsPage />, {
      route: paths.notifications,
      formPath: paths.notifications,
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all as read/i }),
      ).not.toBeDisabled()
    })

    await user.click(screen.getByRole('button', { name: /mark all as read/i }))

    await waitFor(() => {
      expect(markAllNotificationsRead).toHaveBeenCalledTimes(1)
    })
  })

  it('disables mark all as read when there are no unread notifications', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(markAllNotificationsRead).mockClear()
    vi.mocked(getUnreadNotificationCount).mockResolvedValue({ count: 0 })

    renderWithProviders(<NotificationsPage />, {
      route: paths.notifications,
      formPath: paths.notifications,
    })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /mark all as read/i }),
      ).toBeDisabled()
    })

    expect(markAllNotificationsRead).not.toHaveBeenCalled()
  })
})
