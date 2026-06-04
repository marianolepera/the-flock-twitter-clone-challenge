import { AxiosError } from 'axios'
import { vi } from 'vitest'

vi.mock('@/api/users/users-api', () => ({
  followUser: vi.fn(async () => ({ following: true })),
  unfollowUser: vi.fn(async () => {}),
  getFollowing: vi.fn(async () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 50,
  })),
}))

export function throwUsersApiError(status: number, message: string): never {
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
