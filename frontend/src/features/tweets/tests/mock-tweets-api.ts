import { vi } from 'vitest'

import { mockReplyTweet, mockTweet } from '@/features/tweets/tests/fixtures'

vi.mock('@/api/tweets/tweets-api', () => ({
  createTweet: vi.fn(async () => mockTweet),
  deleteTweet: vi.fn(async () => {}),
  likeTweet: vi.fn(async () => mockTweet),
  unlikeTweet: vi.fn(async () => {}),
  getThread: vi.fn(async () => ({
    root: mockTweet,
    replies: [mockReplyTweet],
  })),
}))
