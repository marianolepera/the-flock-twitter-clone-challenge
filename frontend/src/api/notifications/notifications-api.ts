import { apiClient } from '@/api/client'
import type {
  MarkAllReadResponse,
  Notification,
  PaginatedResponse,
  UnreadCountResponse,
} from '@/types/api.types'

export interface PaginationParams {
  page?: number
  limit?: number
}

export async function getNotifications(params: PaginationParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Notification>>(
    '/notifications',
    { params },
  )
  return data
}

export async function getUnreadNotificationCount() {
  const { data } = await apiClient.get<UnreadCountResponse>(
    '/notifications/unread-count',
  )
  return data
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.patch<MarkAllReadResponse>(
    '/notifications/read',
  )
  return data
}

export async function markNotificationRead(notificationId: string) {
  const { data } = await apiClient.patch<Notification>(
    `/notifications/${notificationId}/read`,
  )
  return data
}
