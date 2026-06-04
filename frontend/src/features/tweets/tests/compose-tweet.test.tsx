import '@/features/tweets/tests/mock-tweets-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTweet } from '@/api/tweets/tweets-api'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockTweet } from '@/features/tweets/tests/fixtures'
import { ComposeTweet } from '@/features/tweets/components/ComposeTweet'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('ComposeTweet', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(createTweet).mockReset()
    vi.mocked(createTweet).mockResolvedValue(mockTweet)
  })

  it('disables submit when the tweet is empty', () => {
    renderWithProviders(<ComposeTweet />)

    expect(screen.getByRole('button', { name: /^tweet$/i })).toBeDisabled()
  })

  it('posts a tweet and clears the composer on success', async () => {
    const user = userEvent.setup()

    renderWithProviders(<ComposeTweet />)

    await user.type(
      screen.getByLabelText(/what's happening/i),
      'Hello Flock!',
    )
    await user.click(screen.getByRole('button', { name: /^tweet$/i }))

    await waitFor(() => {
      expect(createTweet).toHaveBeenCalledWith(
        { content: 'Hello Flock!' },
        expect.any(Object),
      )
    })

    expect(screen.getByLabelText(/what's happening/i)).toHaveValue('')
  })

  it('shows an error when the API fails', async () => {
    const user = userEvent.setup()

    vi.mocked(createTweet).mockRejectedValueOnce(new Error('Network error'))

    renderWithProviders(<ComposeTweet />)

    await user.type(screen.getByLabelText(/what's happening/i), 'Will fail')
    await user.click(screen.getByRole('button', { name: /^tweet$/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not post tweet/i,
    )
    expect(screen.getByLabelText(/what's happening/i)).toHaveValue('Will fail')
  })
})
