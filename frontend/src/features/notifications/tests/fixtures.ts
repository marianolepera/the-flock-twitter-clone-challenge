import type { Notification } from '@/types/api.types'

import { mockUser } from '@/features/auth/tests/fixtures'
import { mockBobUser } from '@/features/users/tests/fixtures'

export const mockFollowNotification: Notification = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  type: 'follow',
  actor: {
    id: mockUser.id,
    username: mockUser.username,
    avatarUrl: mockUser.avatarUrl,
  },
  tweet: null,
  readAt: null,
  createdAt: '2024-06-04T11:00:00.000Z',
}

export const mockLikeNotification: Notification = {
  id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  type: 'like',
  actor: {
    id: mockUser.id,
    username: mockUser.username,
    avatarUrl: mockUser.avatarUrl,
  },
  tweet: {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    content: 'Morning deploy ☕',
  },
  readAt: null,
  createdAt: '2024-06-04T11:30:00.000Z',
}

export const mockReadLikeNotification: Notification = {
  ...mockLikeNotification,
  id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
  actor: {
    id: mockBobUser.id,
    username: mockBobUser.username,
    avatarUrl: mockBobUser.avatarUrl,
  },
  readAt: '2024-06-04T12:00:00.000Z',
}
