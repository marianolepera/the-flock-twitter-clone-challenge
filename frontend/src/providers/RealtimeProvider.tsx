import type { ReactNode } from 'react'

import { TimelineUpdatesProvider } from '@/context/TimelineUpdatesProvider'

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return <TimelineUpdatesProvider>{children}</TimelineUpdatesProvider>
}
