import type { ReactNode } from 'react'

export interface FeedSkeletonListProps {
  label: string
  count?: number
  renderItem: () => ReactNode
}

export function FeedSkeletonList({
  label,
  count = 5,
  renderItem,
}: FeedSkeletonListProps) {
  return (
    <ul className="list-none" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>{renderItem()}</li>
      ))}
    </ul>
  )
}
