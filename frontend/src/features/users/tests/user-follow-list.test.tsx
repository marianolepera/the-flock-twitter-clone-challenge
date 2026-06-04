import '@/features/users/tests/mock-users-api'

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getFollowers } from '@/api/users/users-api'
import { UserFollowList } from '@/features/users/components/UserFollowList'
import { renderWithProviders } from '@/test/test-utils'

describe('UserFollowList', () => {
  it('renders followers from the API', async () => {
    renderWithProviders(<UserFollowList username="alice" type="followers" />)

    expect(await screen.findByText(/@bob/i)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /followers/i })).toBeInTheDocument()
    expect(getFollowers).toHaveBeenCalled()
  })

  it('shows empty state when there are no followers', async () => {
    vi.mocked(getFollowers).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })

    renderWithProviders(<UserFollowList username="alice" type="followers" />)

    expect(
      await screen.findByText(/no followers yet/i),
    ).toBeInTheDocument()
  })
})
