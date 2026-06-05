import { env } from '@/config/env'

export function mediaUrl(path: string | null): string | null {
  if (!path) return null

  return `${env.apiUrl}${path}`
}
