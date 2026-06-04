import '@/features/tweets/tests/mock-tweets-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteTweet, likeTweet } from '@/api/tweets/tweets-api'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockTweet } from '@/features/tweets/tests/fixtures'
import { TweetCard } from '@/features/tweets/components/TweetCard'
import { renderWithProviders, resetSnackbarStore } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('TweetCard', () => {
  beforeEach(() => {
    resetSnackbarStore()
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(likeTweet).mockReset()
    vi.mocked(likeTweet).mockResolvedValue({
      ...mockTweet,
      likedByMe: true,
      likesCount: 1,
    })
  })

  it('renders tweet content and author link', () => {
    renderWithProviders(
      <TweetCard tweet={mockTweet} currentUserId={mockAuthResponse.user.id} />,
    )

    expect(screen.getByText(mockTweet.content)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /@alice/i })[0]).toHaveAttribute(
      'href',
      '/alice',
    )
  })

  it('likes a tweet when the like button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TweetCard tweet={mockTweet} currentUserId={mockAuthResponse.user.id} />,
    )

    await user.click(screen.getByRole('button', { name: /like tweet/i }))

    await waitFor(() => {
      expect(likeTweet).toHaveBeenCalledWith(mockTweet.id, expect.any(Object))
    })
  })

  it('shows snackbar after deleting own tweet', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <TweetCard tweet={mockTweet} currentUserId={mockAuthResponse.user.id} />,
    )

    await user.click(screen.getByRole('button', { name: /delete tweet/i }))

    await waitFor(() => {
      expect(deleteTweet).toHaveBeenCalledWith(mockTweet.id, expect.any(Object))
      expect(screen.getByRole('status')).toHaveTextContent('Tweet deleted')
    })
  })

  it('shows delete for own tweets only', () => {
    const { rerender } = renderWithProviders(
      <TweetCard tweet={mockTweet} currentUserId={mockAuthResponse.user.id} />,
    )

    expect(
      screen.getByRole('button', { name: /delete tweet/i }),
    ).toBeInTheDocument()

    rerender(
      <TweetCard
        tweet={{
          ...mockTweet,
          authorId: 'other-user',
          author: { ...mockTweet.author, username: 'bob' },
        }}
        currentUserId={mockAuthResponse.user.id}
      />,
    )

    expect(
      screen.queryByRole('button', { name: /delete tweet/i }),
    ).not.toBeInTheDocument()
  })
})
