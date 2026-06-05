import { useMarkNotificationRead } from '@/hooks/notifications/useMarkNotificationRead/useMarkNotificationRead'
import { paths } from '@/routes/paths'
import type { Notification } from '@/types/api.types'

export function getNotificationMessage(notification: Notification) {
  if (notification.type === 'follow') {
    return {
      actorUsername: notification.actor.username,
      action: 'followed you' as const,
    }
  }

  if (notification.type === 'reply') {
    return {
      actorUsername: notification.actor.username,
      action: 'replied to your tweet' as const,
    }
  }

  return {
    actorUsername: notification.actor.username,
    action: 'liked your tweet' as const,
  }
}

export function getNotificationHref(notification: Notification) {
  if (notification.type === 'follow') {
    return paths.profile(notification.actor.username)
  }

  if (notification.tweet) {
    return paths.tweet(notification.tweet.id)
  }

  return paths.profile(notification.actor.username)
}

export function useNotificationItem(notification: Notification) {
  const { mutate: markAsRead } = useMarkNotificationRead()

  const isUnread = notification.readAt === null
  const href = getNotificationHref(notification)

  function handleClick() {
    if (!isUnread) return

    markAsRead(notification.id)
  }

  return {
    isUnread,
    href,
    handleClick,
    message: getNotificationMessage(notification),
  }
}
