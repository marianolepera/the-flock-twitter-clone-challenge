import { vi } from 'vitest'

import {
  mockFollowNotification,
  mockLikeNotification,
} from '@/features/notifications/tests/fixtures'

export const mockNotificationsPage = {
  items: [mockLikeNotification, mockFollowNotification],
  total: 2,
  page: 1,
  limit: 20,
}

vi.mock('@/api/notifications/notifications-api', () => ({
  getNotifications: vi.fn(async () => mockNotificationsPage),
  getUnreadNotificationCount: vi.fn(async () => ({ count: 2 })),
  markAllNotificationsRead: vi.fn(async () => ({ updated: 2 })),
  markNotificationRead: vi.fn(async (id: string) => ({
    ...mockLikeNotification,
    id,
    readAt: '2024-06-04T12:00:00.000Z',
  })),
}))
