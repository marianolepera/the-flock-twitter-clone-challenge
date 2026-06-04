import '@/features/notifications/tests/mock-notifications-api'

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getNotifications } from '@/api/notifications/notifications-api'
import { NotificationsFeed } from '@/features/notifications/components/NotificationsFeed'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('NotificationsFeed', () => {
  it('renders notifications from the API', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(<NotificationsFeed />)

    expect(
      await screen.findByRole('link', { name: /@alice liked your tweet/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /@alice followed you/i }),
    ).toBeInTheDocument()
    expect(getNotifications).toHaveBeenCalled()
  })

  it('shows empty state when there are no notifications', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    vi.mocked(getNotifications).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })

    renderWithProviders(<NotificationsFeed />)

    expect(
      await screen.findByText(/nothing here — yet/i),
    ).toBeInTheDocument()
  })
})
