import { vi } from 'vitest'

import { mockTweet } from '@/features/tweets/tests/fixtures'

vi.mock('@/api/tweets/tweets-api', () => ({
  createTweet: vi.fn(async () => mockTweet),
  deleteTweet: vi.fn(async () => {}),
  likeTweet: vi.fn(async () => mockTweet),
  unlikeTweet: vi.fn(async () => {}),
}))
