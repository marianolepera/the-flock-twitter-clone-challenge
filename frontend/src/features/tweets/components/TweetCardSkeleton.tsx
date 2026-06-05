import { Skeleton } from '@/components/atoms/Skeleton'

export function TweetCardSkeleton() {
  return (
    <article className="border-b border-border px-4 py-3">
      <div className="flex gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3.5 w-16" />
          </div>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-3/5" />
          </div>
          <Skeleton className="mt-3 h-8 w-14 rounded-full" />
        </div>
      </div>
    </article>
  )
}
