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
  parentTweetId: null,
  imageUrl: null,
  likesCount: 0,
  likedByMe: false,
  repliesCount: 0,
  createdAt: '2024-01-02T12:00:00.000Z',
  updatedAt: '2024-01-02T12:00:00.000Z',
}

export const mockReplyTweet: Tweet = {
  ...mockTweet,
  id: '33333333-3333-3333-3333-333333333333',
  content: 'Great point!',
  parentTweetId: mockTweet.id,
  authorId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  author: {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    username: 'bob',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=bob',
  },
}
