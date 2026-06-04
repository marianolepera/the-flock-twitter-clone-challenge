import '@/features/users/tests/mock-users-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { followUser, getFollowing } from '@/api/users/users-api'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockBobUser } from '@/features/users/tests/fixtures'
import { UserCard } from '@/features/users/components/UserCard'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('UserCard', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(followUser).mockReset()
    vi.mocked(getFollowing).mockReset()
    vi.mocked(followUser).mockResolvedValue({ following: true })
    vi.mocked(getFollowing).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 50,
    })
  })

  it('shows follow control and follows user from search result', async () => {
    const user = userEvent.setup()

    renderWithProviders(<UserCard user={mockBobUser} />)

    expect(await screen.findByText(/@bob/i)).toBeInTheDocument()
    expect(screen.getByText(/coffee, code/i)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: /follow @bob/i }))

    await waitFor(() => {
      expect(followUser).toHaveBeenCalledWith('bob', expect.any(Object))
    })
  })

  it('does not show follow button on own profile card', async () => {
    renderWithProviders(<UserCard user={mockAuthResponse.user} />)

    expect(await screen.findByText(/@alice/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /follow @alice/i }),
    ).not.toBeInTheDocument()
  })
})
