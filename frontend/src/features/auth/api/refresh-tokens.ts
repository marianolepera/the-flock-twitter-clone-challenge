import axios from 'axios'

import { env } from '@/config/env'
import type { RefreshTokenResponse } from '@/types/api.types'

/** Standalone call — avoids circular import with apiClient interceptors. */
export async function refreshTokens(refreshToken: string) {
  const { data } = await axios.post<RefreshTokenResponse>(
    `${env.apiUrl}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  return data
}
