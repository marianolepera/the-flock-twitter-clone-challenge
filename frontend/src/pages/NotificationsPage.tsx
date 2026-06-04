import { NotificationsFeed } from '@/features/notifications/components/NotificationsFeed'
import { Button } from '@/components/atoms/Button'
import { useGetUnreadCount } from '@/hooks/notifications/useGetUnreadCount/useGetUnreadCount'
import { useMarkAllRead } from '@/hooks/notifications/useMarkAllRead/useMarkAllRead'

export function NotificationsPage() {
  const { data: unreadData } = useGetUnreadCount()
  const { mutate: markAllRead, isPending } = useMarkAllRead()
  const unreadCount = unreadData?.count ?? 0
  const canMarkAllRead = unreadCount > 0

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
