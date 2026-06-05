import { createContext } from 'react'

export interface TimelineUpdatesContextValue {
  hasNewTweets: boolean
  refreshTimeline: () => void
}

export const TimelineUpdatesContext =
  createContext<TimelineUpdatesContextValue | null>(null)
