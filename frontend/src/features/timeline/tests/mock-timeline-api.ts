import { vi } from 'vitest'

import { mockTweet } from '@/features/tweets/tests/fixtures'

export const mockTimelinePage = {
  items: [mockTweet],
  hasMore: false,
  nextCursor: null,
}

vi.mock('@/api/timeline/timeline-api', () => ({
  getTimeline: vi.fn(async () => mockTimelinePage),
}))
