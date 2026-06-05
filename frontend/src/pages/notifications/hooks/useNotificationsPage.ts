import { useGetUnreadCount } from '@/hooks/notifications/useGetUnreadCount/useGetUnreadCount'
import { useMarkAllRead } from '@/hooks/notifications/useMarkAllRead/useMarkAllRead'

export function useNotificationsPage() {
  const { data: unreadData } = useGetUnreadCount()
  const { mutate: markAllRead, isPending } = useMarkAllRead()
  const unreadCount = unreadData?.count ?? 0
  const canMarkAllRead = unreadCount > 0

  return { markAllRead, isPending, canMarkAllRead }
}
