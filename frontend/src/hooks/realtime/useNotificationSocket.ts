import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { notificationKeys } from '@/hooks/notifications/query-keys'
import { NOTIFICATION_NEW_EVENT } from '@/lib/realtime-events'
import { getSocket } from '@/lib/socket'

export function useNotificationSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const onNewNotification = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      })
    }

    const subscribe = () => {
      const socket = getSocket()
      if (!socket) return
      socket.on(NOTIFICATION_NEW_EVENT, onNewNotification)
    }

    const socket = getSocket()
    if (!socket) return

    if (socket.connected) {
      subscribe()
    } else {
      socket.once('connect', subscribe)
    }

    return () => {
      socket.off('connect', subscribe)
      socket.off(NOTIFICATION_NEW_EVENT, onNewNotification)
    }
  }, [queryClient])
}
