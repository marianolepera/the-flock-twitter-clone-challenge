import '@/features/notifications/tests/mock-notifications-api'

import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getUnreadNotificationCount } from '@/api/notifications/notifications-api'
import { NotificationNavItem } from '@/components/molecules/NotificationNavItem'
import { renderWithProviders } from '@/test/test-utils'

describe('NotificationNavItem', () => {
  it('shows unread badge when count is greater than zero', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue({ count: 4 })

    renderWithProviders(<NotificationNavItem />)

    expect(
      await screen.findByLabelText(/4 unread notifications/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /notifications/i })).toHaveAttribute(
      'href',
      '/notifications',
    )
  })

  it('hides badge when there are no unread notifications', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue({ count: 0 })

    renderWithProviders(<NotificationNavItem />)

    await waitFor(() => {
      expect(getUnreadNotificationCount).toHaveBeenCalled()
    })

    expect(
      screen.queryByLabelText(/unread notifications/i),
    ).not.toBeInTheDocument()
  })

  it('caps the badge at 99+', async () => {
    vi.mocked(getUnreadNotificationCount).mockResolvedValue({ count: 120 })

    renderWithProviders(<NotificationNavItem />)

    expect(
      await screen.findByLabelText(/120 unread notifications/i),
    ).toBeInTheDocument()
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})
