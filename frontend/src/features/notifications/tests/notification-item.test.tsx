import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import {
  mockFollowNotification,
  mockLikeNotification,
  mockReadLikeNotification,
} from '@/features/notifications/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'

describe('NotificationItem', () => {
  it('links like notifications to the actor profile', () => {
    renderWithProviders(<NotificationItem notification={mockLikeNotification} />)

    const link = screen.getByRole('link', { name: /@alice liked your tweet/i })
    expect(link).toHaveAttribute('href', '/alice')
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

    expect(screen.getByRole('link')).toHaveAttribute('href', '/bob')
    expect(screen.queryByLabelText(/unread/i)).not.toBeInTheDocument()
  })
})
