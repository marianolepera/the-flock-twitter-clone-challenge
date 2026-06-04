import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { apiClient } from '@/api/client'
import { refreshTokens } from '@/api/auth/refresh-tokens'
import { useAuthStore } from '@/stores/auth.store'

const PUBLIC_PATH_PREFIXES = ['/auth/login', '/auth/register', '/auth/refresh', '/health']

function isPublicRequest(url: string | undefined) {
  if (!url) return false
  return PUBLIC_PATH_PREFIXES.some((path) => url.includes(path))
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isPublicRequest(config.url)) {
    return config
  }

  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens, clearSession } = useAuthStore.getState()

  if (!refreshToken) {
    clearSession()
    throw new Error('No refresh token')
  }

  const tokens = await refreshTokens(refreshToken)
  setTokens(tokens)
  return tokens.accessToken
}

function queueRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (!config || status !== 401 || config._retry || isPublicRequest(config.url)) {
      return Promise.reject(error)
    }

    config._retry = true

    try {
      const accessToken = await queueRefresh()
      config.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(config)
    } catch (refreshError) {
      useAuthStore.getState().clearSession()
      return Promise.reject(refreshError)
    }
  },
)
