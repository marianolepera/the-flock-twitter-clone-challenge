import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { TimelineUpdatesContext } from '@/context/timeline-updates-context'
import { useNotificationSocket } from '@/hooks/realtime/useNotificationSocket'
import { useSocket } from '@/hooks/realtime/useSocket'
import { timelineKeys } from '@/hooks/timeline/query-keys'
import { TIMELINE_NEW_TWEET_EVENT } from '@/lib/realtime-events'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth.store'
import type { Tweet } from '@/types/api.types'

export function TimelineUpdatesProvider({ children }: { children: ReactNode }) {
  useSocket()
  useNotificationSocket()

  const userId = useAuthStore((s) => s.user?.id)
  const queryClient = useQueryClient()
  const [hasNewTweets, setHasNewTweets] = useState(false)

  useEffect(() => {
    if (!userId) return

    const onNewTweet = (tweet: Tweet) => {
      if (tweet.authorId === userId) return
      setHasNewTweets(true)
    }

    const subscribe = () => {
      const socket = getSocket()
      if (!socket) return
      socket.on(TIMELINE_NEW_TWEET_EVENT, onNewTweet)
    }

    const socket = getSocket()
    if (!socket) return

    if (socket.connected) {
      subscribe()
    } else {
      socket.once('connect', subscribe)
    }

    return () => {
      socket.off('connect', subscribe)
      socket.off(TIMELINE_NEW_TWEET_EVENT, onNewTweet)
    }
  }, [userId])

  const refreshTimeline = useCallback(() => {
    setHasNewTweets(false)
    void queryClient.invalidateQueries({ queryKey: timelineKeys.all })
  }, [queryClient])

  const value = useMemo(
    () => ({ hasNewTweets, refreshTimeline }),
    [hasNewTweets, refreshTimeline],
  )

  return (
    <TimelineUpdatesContext.Provider value={value}>
      {children}
    </TimelineUpdatesContext.Provider>
  )
}
