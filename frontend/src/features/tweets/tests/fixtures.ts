import type { Tweet } from '@/types/api.types'

import { mockUser } from '@/features/auth/tests/fixtures'

export const mockTweet: Tweet = {
  id: '22222222-2222-2222-2222-222222222222',
  content: 'Hello Flock!',
  authorId: mockUser.id,
  author: {
    id: mockUser.id,
    username: mockUser.username,
    avatarUrl: mockUser.avatarUrl,
  },
  likesCount: 0,
  likedByMe: false,
  createdAt: '2024-01-02T12:00:00.000Z',
  updatedAt: '2024-01-02T12:00:00.000Z',
}
