import { useQuery } from '@tanstack/react-query'

import { getUnreadNotificationCount } from '@/api/notifications/notifications-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'

const POLL_INTERVAL_MS = 30_000

export function useGetUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    refetchInterval: POLL_INTERVAL_MS,
  })
}
