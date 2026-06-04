import { io, type Socket } from 'socket.io-client'

import { env } from '@/config/env'

let socket: Socket | null = null

export function connectSocket(accessToken: string): Socket {
  if (socket) {
    socket.auth = { token: accessToken }
    if (!socket.connected) {
      socket.connect()
    }
    return socket
  }

  socket = io(`${env.apiUrl}/events`, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  })

  return socket
}

export function disconnectSocket(): void {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}
