import { useQuery } from '@tanstack/react-query'

import { getUnreadNotificationCount } from '@/api/notifications/notifications-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'

export function useGetUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
  })
}
