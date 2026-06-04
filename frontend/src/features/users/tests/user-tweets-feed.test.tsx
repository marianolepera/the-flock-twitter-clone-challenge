import '@/features/users/tests/mock-users-api'

import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { getUserTweets } from '@/api/users/users-api'
import { UserTweetsFeed } from '@/features/users/components/UserTweetsFeed'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockTweet } from '@/features/tweets/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('UserTweetsFeed', () => {
  it('renders tweets for the profile user', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(<UserTweetsFeed username="alice" />)

    expect(await screen.findByText(mockTweet.content)).toBeInTheDocument()
    expect(getUserTweets).toHaveBeenCalled()
  })

  it('shows empty state when the user has no tweets', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(getUserTweets).mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })

    renderWithProviders(<UserTweetsFeed username="alice" />)

    expect(await screen.findByText(/no tweets yet/i)).toBeInTheDocument()
  })
})
