import { Button } from '@/components/atoms/Button'
import { NotificationsFeed } from '@/features/notifications/components/NotificationsFeed'

import { useNotificationsPage } from './hooks/useNotificationsPage'

export function NotificationsPage() {
  const { markAllRead, isPending, canMarkAllRead } = useNotificationsPage()

  return (
    <>
      <header className="sticky top-[57px] z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:top-0">
        <h1 className="text-xl font-bold">Notifications</h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="font-normal text-foreground hover:underline disabled:opacity-40"
          disabled={!canMarkAllRead || isPending}
          onClick={() => markAllRead()}
        >
          Mark all as read
        </Button>
      </header>

      <NotificationsFeed />
    </>
  )
}
