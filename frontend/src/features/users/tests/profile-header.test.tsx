import '@/features/users/tests/mock-users-api'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfileHeader } from '@/features/users/components/ProfileHeader'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockBobUser } from '@/features/users/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('ProfileHeader', () => {
  it('shows edit bio on own profile', () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(
      <ProfileHeader
        user={mockAuthResponse.user}
        activeTab="tweets"
        onTabChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /edit bio/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /follow @/i })).not.toBeInTheDocument()
  })

  it('shows follow button on another user profile', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(
      <ProfileHeader
        user={mockBobUser}
        activeTab="tweets"
        onTabChange={vi.fn()}
      />,
    )

    expect(
      await screen.findByRole('button', { name: /follow @bob/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /edit bio/i })).not.toBeInTheDocument()
  })

  it('calls onTabChange when a stat is clicked', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    const onTabChange = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <ProfileHeader
        user={mockAuthResponse.user}
        activeTab="tweets"
        onTabChange={onTabChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: /following/i }))

    expect(onTabChange).toHaveBeenCalledWith('following')
  })
})
