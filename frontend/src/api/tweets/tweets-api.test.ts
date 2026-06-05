import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/api/client'
import {
  createTweet,
  deleteTweet,
  getThread,
  likeTweet,
  unlikeTweet,
} from '@/api/tweets/tweets-api'

vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
}))

describe('tweets-api', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset()
    vi.mocked(apiClient.delete).mockReset()
    vi.mocked(apiClient.get).mockReset()
  })

  it('createTweet posts to /tweets', async () => {
    const tweet = { id: 't1', content: 'Hi' }
    vi.mocked(apiClient.post).mockResolvedValue({ data: tweet })

    await expect(createTweet({ content: 'Hi' })).resolves.toEqual(tweet)

    expect(apiClient.post).toHaveBeenCalledWith('/tweets', { content: 'Hi' })
  })

  it('deleteTweet calls DELETE /tweets/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({})

    await deleteTweet('tweet-id')

    expect(apiClient.delete).toHaveBeenCalledWith('/tweets/tweet-id')
  })

  it('likeTweet posts to /tweets/:id/like', async () => {
    const tweet = { id: 't1', likedByMe: true }
    vi.mocked(apiClient.post).mockResolvedValue({ data: tweet })

    await expect(likeTweet('t1')).resolves.toEqual(tweet)

    expect(apiClient.post).toHaveBeenCalledWith('/tweets/t1/like')
  })

  it('getThread fetches /tweets/:id/thread', async () => {
    const thread = { root: { id: 't1' }, replies: [] }
    vi.mocked(apiClient.get).mockResolvedValue({ data: thread })

    await expect(getThread('t1')).resolves.toEqual(thread)

    expect(apiClient.get).toHaveBeenCalledWith('/tweets/t1/thread')
  })

  it('unlikeTweet deletes /tweets/:id/like', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({})

    await unlikeTweet('t1')

    expect(apiClient.delete).toHaveBeenCalledWith('/tweets/t1/like')
  })
})
