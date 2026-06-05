import { Skeleton } from '@/components/atoms/Skeleton'

export function NotificationItemSkeleton() {
  return (
    <article className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full max-w-sm" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <Skeleton className="hidden h-4 w-24 shrink-0 sm:block" />
      </div>
    </article>
  )
}
