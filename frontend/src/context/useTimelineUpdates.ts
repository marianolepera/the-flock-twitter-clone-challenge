import { useContext } from 'react'

import { TimelineUpdatesContext } from '@/context/timeline-updates-context'

export function useTimelineUpdates() {
  const context = useContext(TimelineUpdatesContext)
  if (!context) {
    throw new Error('useTimelineUpdates must be used within TimelineUpdatesProvider')
  }
  return context
}
