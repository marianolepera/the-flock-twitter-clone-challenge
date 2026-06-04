import { Bell } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useGetUnreadCount } from '@/hooks/notifications/useGetUnreadCount/useGetUnreadCount'
import { cn } from '@/lib/cn'
import { paths } from '@/routes/paths'

export interface NotificationNavItemProps {
  className?: string
  compact?: boolean
}

function formatBadgeCount(count: number) {
  if (count > 99) return '99+'
  return String(count)
}

export function NotificationNavItem({
  className,
  compact = false,
}: NotificationNavItemProps) {
  const { data } = useGetUnreadCount()
  const unreadCount = data?.count ?? 0

  return (
    <NavLink
      to={paths.notifications}
      end
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-full px-3 py-2.5 text-foreground transition-colors',
          'hover:bg-surface',
          isActive && 'font-bold',
          className,
        )
      }
    >
      <span className="relative shrink-0">
        <Bell className="size-6" aria-hidden />
        {unreadCount > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex min-w-[1.125rem] items-center justify-center rounded-full bg-like px-1 text-[10px] font-bold leading-none text-white"
            aria-label={`${unreadCount} unread notifications`}
          >
            {formatBadgeCount(unreadCount)}
          </span>
        ) : null}
      </span>
      {!compact ? <span className="hidden lg:inline">Notifications</span> : null}
      <span className="sr-only lg:hidden">Notifications</span>
    </NavLink>
  )
}
