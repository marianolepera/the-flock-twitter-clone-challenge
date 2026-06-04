import { AxiosError } from 'axios'
import { vi } from 'vitest'

import type { LoginPayload, RegisterPayload } from '@/api/auth/auth-api'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'

function throwApiError(status: number, message: string): never {
  throw new AxiosError(
    message,
    AxiosError.ERR_BAD_REQUEST,
    undefined,
    undefined,
    {
      status,
      data: { statusCode: status, message },
      headers: {},
      statusText: '',
      config: {} as never,
    },
  )
}

vi.mock('@/api/auth/auth-api', () => ({
  login: vi.fn(async (payload: LoginPayload) => {
    if (
      payload.email === 'alice@example.com' &&
      payload.password === 'Password123!'
    ) {
      return mockAuthResponse
    }
    throwApiError(401, 'Invalid credentials')
  }),

  register: vi.fn(async (payload: RegisterPayload) => {
    if (payload.email === 'taken@example.com') {
      throwApiError(409, 'Email already in use')
    }
    if (payload.username === 'taken_user') {
      throwApiError(409, 'Username already in use')
    }

    return {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: {
        ...mockAuthResponse.user,
        email: payload.email,
        username: payload.username,
      },
    }
  }),

  logout: vi.fn(async () => {}),
}))
