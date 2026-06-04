import { Heart, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar } from '@/components/atoms/Avatar'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { cn } from '@/lib/cn'
import { paths } from '@/routes/paths'
import type { Notification } from '@/types/api.types'

export interface NotificationItemProps {
  notification: Notification
}

function notificationMessage(notification: Notification) {
  if (notification.type === 'follow') {
    return (
      <>
        <span className="font-bold text-foreground">
          @{notification.actor.username}
        </span>{' '}
        followed you
      </>
    )
  }

  return (
    <>
      <span className="font-bold text-foreground">
        @{notification.actor.username}
      </span>{' '}
      liked your tweet
    </>
  )
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const isUnread = notification.readAt === null
  const actorProfilePath = paths.profile(notification.actor.username)

  return (
    <article
      className={cn(
        'border-b border-border transition-colors',
        isUnread && 'bg-brand-muted/40 dark:bg-brand/10',
      )}
    >
      <Link
        to={actorProfilePath}
        className="flex gap-3 px-4 py-3 hover:bg-surface"
      >
        <div className="relative shrink-0">
          <Avatar
            src={notification.actor.avatarUrl}
            alt={notification.actor.username}
            size="md"
          />
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-background',
              notification.type === 'follow'
                ? 'bg-brand text-brand-foreground'
                : 'bg-like text-white',
            )}
            aria-hidden
          >
            {notification.type === 'follow' ? (
              <UserPlus className="size-3" strokeWidth={2.5} />
            ) : (
              <Heart className="size-3 fill-current" strokeWidth={0} />
            )}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-snug text-foreground">
            {notificationMessage(notification)}
          </p>
          <time
            className="mt-1 block text-sm text-muted"
            dateTime={notification.createdAt}
          >
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>

        {notification.tweet ? (
          <p className="max-w-[120px] shrink-0 truncate text-sm text-muted sm:max-w-[180px]">
            {notification.tweet.content}
          </p>
        ) : null}

        {isUnread ? (
          <span
            className="mt-2 size-2 shrink-0 rounded-full bg-brand"
            aria-label="Unread"
          />
        ) : null}
      </Link>
    </article>
  )
}
