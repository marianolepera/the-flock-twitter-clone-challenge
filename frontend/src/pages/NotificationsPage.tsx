import { useEffect, useRef } from 'react'

import { NotificationsFeed } from '@/features/notifications/components/NotificationsFeed'
import { Button } from '@/components/atoms/Button'
import { useMarkAllRead } from '@/hooks/notifications/useMarkAllRead/useMarkAllRead'

export function NotificationsPage() {
  const { mutate: markAllRead, isPending } = useMarkAllRead()
  const didMarkOnMount = useRef(false)

  useEffect(() => {
    if (didMarkOnMount.current) return
    didMarkOnMount.current = true
    markAllRead()
  }, [markAllRead])

  return (
    <>
      <header className="sticky top-[57px] z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-brand hover:text-brand-hover"
          disabled={isPending}
          onClick={() => markAllRead()}
        >
          Mark all as read
        </Button>
      </header>

      <NotificationsFeed />
    </>
  )
}
