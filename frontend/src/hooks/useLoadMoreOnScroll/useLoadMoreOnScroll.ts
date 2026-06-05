import { useEffect, useRef } from 'react'

export function useLoadMoreOnScroll(
  enabled: boolean,
  onLoadMore: () => void,
  rootMargin = '240px',
) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || !enabled) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore()
        }
      },
      { rootMargin },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [enabled, onLoadMore, rootMargin])

  return loadMoreRef
}
