import { useMutation, useQueryClient } from '@tanstack/react-query'

import { markAllNotificationsRead } from '@/api/notifications/notifications-api'
import { notificationKeys } from '@/hooks/notifications/query-keys'

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
