import { isAxiosError } from 'axios'

import type { ApiErrorBody } from '@/types/api.types'

export function formatApiError(error: unknown, fallback = 'Something went wrong') {
  if (!isAxiosError<ApiErrorBody>(error)) {
    return fallback
  }

  const message = error.response?.data?.message

  if (Array.isArray(message)) {
    return message.join('. ')
  }

  if (typeof message === 'string' && message.length > 0) {
    return message
  }

  if (error.response?.status === 401) {
    return 'Invalid email or password'
  }

  return fallback
}
