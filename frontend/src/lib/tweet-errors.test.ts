import { AxiosError, type AxiosResponse } from 'axios'
import { describe, expect, it } from 'vitest'

import { isTweetNotFoundError } from '@/lib/tweet-errors'
import type { ApiErrorBody } from '@/types/api.types'

function notFoundError(message: string) {
  return new AxiosError(
    'Not Found',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      status: 404,
      data: { statusCode: 404, message },
    } as AxiosResponse<ApiErrorBody>,
  )
}

describe('isTweetNotFoundError', () => {
  it('returns true for parent tweet not found responses', () => {
    expect(
      isTweetNotFoundError(notFoundError('Parent tweet not found')),
    ).toBe(true)
  })

  it('returns true for missing thread tweet responses', () => {
    expect(isTweetNotFoundError(notFoundError('Tweet not found'))).toBe(true)
  })

  it('returns false for other errors', () => {
    expect(isTweetNotFoundError(new Error('Network error'))).toBe(false)
    expect(
      isTweetNotFoundError(
        new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', undefined, undefined, {
          status: 401,
          data: { statusCode: 401, message: 'Unauthorized' },
        } as AxiosResponse<ApiErrorBody>),
      ),
    ).toBe(false)
  })
})
