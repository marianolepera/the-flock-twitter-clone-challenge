import { isAxiosError } from 'axios'

import type { ApiErrorBody } from '@/types/api.types'

function errorMessage(error: unknown): string {
  if (!isAxiosError<ApiErrorBody>(error)) return ''

  const message = error.response?.data?.message

  if (Array.isArray(message)) {
    return message.join('. ')
  }

  return typeof message === 'string' ? message : ''
}

export function isTweetNotFoundError(error: unknown): boolean {
  if (!isAxiosError<ApiErrorBody>(error)) return false
  if (error.response?.status !== 404) return false

  return /tweet not found/i.test(errorMessage(error))
}
