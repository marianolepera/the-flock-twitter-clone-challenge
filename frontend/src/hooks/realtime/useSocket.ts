import { useEffect } from 'react'

import { connectSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/stores/auth.store'

export function useSocket() {
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket()
      return
    }

    connectSocket(accessToken)

    return () => {
      disconnectSocket()
    }
  }, [accessToken])
}
