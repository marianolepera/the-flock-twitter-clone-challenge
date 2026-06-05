import { Skeleton } from '@/components/atoms/Skeleton'

export function UserCardSkeleton() {
  return (
    <article className="flex items-start gap-3 border-b border-border px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3.5 w-full max-w-xs" />
      </div>
      <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
    </article>
  )
}
