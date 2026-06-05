import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import {
  mockFollowNotification,
  mockLikeNotification,
  mockReadLikeNotification,
} from '@/features/notifications/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'

const markAsRead = vi.fn()

vi.mock(
  '@/hooks/notifications/useMarkNotificationRead/useMarkNotificationRead',
  () => ({
    useMarkNotificationRead: () => ({ mutate: markAsRead }),
  }),
)

describe('NotificationItem', () => {
  beforeEach(() => {
    markAsRead.mockReset()
  })

  it('links like notifications to the tweet thread', () => {
    renderWithProviders(<NotificationItem notification={mockLikeNotification} />)

    const link = screen.getByRole('link', { name: /@alice liked your tweet/i })
    expect(link).toHaveAttribute(
      'href',
      `/tweets/${mockLikeNotification.tweet!.id}`,
    )
    expect(screen.getByText(/morning deploy/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/unread/i)).toBeInTheDocument()
  })

  it('links follow notifications to the actor profile', () => {
    renderWithProviders(
      <NotificationItem notification={mockFollowNotification} />,
    )

    const link = screen.getByRole('link', { name: /@alice followed you/i })
    expect(link).toHaveAttribute('href', '/alice')
  })

  it('does not show unread indicator when already read', () => {
    renderWithProviders(
      <NotificationItem notification={mockReadLikeNotification} />,
    )

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/tweets/${mockReadLikeNotification.tweet!.id}`,
    )
    expect(screen.queryByLabelText(/unread/i)).not.toBeInTheDocument()
  })

  it('marks an unread notification as read when clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<NotificationItem notification={mockLikeNotification} />)

    await user.click(
      screen.getByRole('link', { name: /@alice liked your tweet/i }),
    )

    expect(markAsRead).toHaveBeenCalledWith(mockLikeNotification.id)
  })
})
