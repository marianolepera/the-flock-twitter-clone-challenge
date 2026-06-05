import type { InfiniteData } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markNotificationRead } from '@/api/notifications/notifications-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'
import type {
  Notification,
  PaginatedResponse,
  UnreadCountResponse,
} from '@/types/api.types'

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previousNotifications = queryClient.getQueriesData<
        InfiniteData<PaginatedResponse<Notification>>
      >({ queryKey: notificationKeys.list() })
      const previousUnreadCount = queryClient.getQueryData<UnreadCountResponse>(
        notificationKeys.unreadCount(),
      )

      const readAt = new Date().toISOString()
      let wasUnread = false

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<Notification>>>(
        { queryKey: notificationKeys.list() },
        (old) => {
          if (!old?.pages) return old

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((notification) => {
                if (notification.id !== notificationId) return notification
                if (notification.readAt !== null) return notification

                wasUnread = true
                return { ...notification, readAt }
              }),
            })),
          }
        },
      )

      if (wasUnread) {
        queryClient.setQueryData<UnreadCountResponse>(
          notificationKeys.unreadCount(),
          (old) => ({
            count: Math.max(0, (old?.count ?? 0) - 1),
          }),
        )
      }

      return { previousNotifications, previousUnreadCount }
    },
    onError: (_error, _notificationId, context) => {
      for (const [key, data] of context?.previousNotifications ?? []) {
        queryClient.setQueryData(key, data)
      }

      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousUnreadCount,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
