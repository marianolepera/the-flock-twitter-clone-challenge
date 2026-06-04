import type { ReactNode } from 'react'

import { TimelineUpdatesProvider } from '@/context/timeline-updates-context'

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return <TimelineUpdatesProvider>{children}</TimelineUpdatesProvider>
}
