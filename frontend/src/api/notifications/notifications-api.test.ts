import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiClient } from '@/api/client'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications/notifications-api'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('notifications-api', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.patch).mockReset()
  })

  it('getNotifications calls GET /notifications with params', async () => {
    const payload = { items: [], total: 0, page: 1, limit: 20 }
    vi.mocked(apiClient.get).mockResolvedValue({ data: payload })

    await expect(getNotifications({ page: 2, limit: 10 })).resolves.toEqual(
      payload,
    )

    expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
      params: { page: 2, limit: 10 },
    })
  })

  it('getUnreadNotificationCount calls GET /notifications/unread-count', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { count: 5 } })

    await expect(getUnreadNotificationCount()).resolves.toEqual({ count: 5 })

    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count')
  })

  it('markAllNotificationsRead calls PATCH /notifications/read', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ data: { updated: 3 } })

    await expect(markAllNotificationsRead()).resolves.toEqual({ updated: 3 })

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read')
  })

  it('markNotificationRead calls PATCH /notifications/:id/read', async () => {
    const payload = {
      id: 'n1',
      type: 'like' as const,
      actor: { id: 'u1', username: 'alice', avatarUrl: null },
      tweet: { id: 't1', content: 'Hello' },
      readAt: '2024-06-04T12:00:00.000Z',
      createdAt: '2024-06-04T11:00:00.000Z',
    }
    vi.mocked(apiClient.patch).mockResolvedValue({ data: payload })

    await expect(markNotificationRead('n1')).resolves.toEqual(payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/n1/read')
  })
})
