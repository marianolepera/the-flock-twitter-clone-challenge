import '@/features/timeline/tests/mock-timeline-api'

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { getTimeline } from '@/api/timeline/timeline-api'
import { TimelineFeed } from '@/features/timeline/components/TimelineFeed'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockTweet } from '@/features/tweets/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('TimelineFeed', () => {
  it('renders tweets from the timeline API', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    renderWithProviders(<TimelineFeed />)

    expect(await screen.findByText(mockTweet.content)).toBeInTheDocument()
    expect(getTimeline).toHaveBeenCalled()
  })

  it('shows empty state when the timeline has no tweets', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(getTimeline).mockResolvedValueOnce({
      items: [],
      hasMore: false,
      nextCursor: null,
    })

    renderWithProviders(<TimelineFeed />)

    expect(
      await screen.findByText(/your timeline is empty/i),
    ).toBeInTheDocument()
  })

  it('shows error state with retry when the API fails', async () => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(getTimeline).mockRejectedValueOnce(new Error('Network error'))

    const user = userEvent.setup()

    renderWithProviders(<TimelineFeed />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/could not load timeline/i)

    vi.mocked(getTimeline).mockResolvedValueOnce({
      items: [mockTweet],
      hasMore: false,
      nextCursor: null,
    })

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText(mockTweet.content)).toBeInTheDocument()
  })
})
