import '@/features/tweets/tests/mock-tweets-api'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { createTweet } from '@/api/tweets/tweets-api'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockReplyTweet, mockTweet } from '@/features/tweets/tests/fixtures'
import { TweetThreadPage } from '@/pages/tweet-thread/TweetThreadPage'
import {
  createTestQueryClient,
  resetSnackbarStore,
} from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

function renderThreadPage(tweetId: string) {
  const queryClient = createTestQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/tweets/${tweetId}`]}>
        <Routes>
          <Route path="/tweets/:tweetId" element={<TweetThreadPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TweetThreadPage', () => {
  beforeEach(() => {
    resetSnackbarStore()
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(createTweet).mockReset()
    vi.mocked(createTweet).mockResolvedValue(mockReplyTweet)
  })

  it('renders the root tweet and replies', async () => {
    renderThreadPage(mockTweet.id)

    expect(await screen.findByText(mockTweet.content)).toBeInTheDocument()
    expect(screen.getByText(mockReplyTweet.content)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /thread/i })).toBeInTheDocument()
  })

  it('posts a reply with parentTweetId', async () => {
    const user = userEvent.setup()

    renderThreadPage(mockTweet.id)

    await screen.findByText(mockTweet.content)

    await user.type(screen.getByLabelText(/post your reply/i), 'My reply')
    await user.click(screen.getByRole('button', { name: /^reply$/i }))

    await waitFor(() => {
      expect(createTweet).toHaveBeenCalledWith(
        {
          content: 'My reply',
          parentTweetId: mockTweet.id,
        },
        expect.any(Object),
      )
    })
  })
})
