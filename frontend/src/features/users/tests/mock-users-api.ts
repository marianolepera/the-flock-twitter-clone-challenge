import { AxiosError } from 'axios'
import { vi } from 'vitest'

import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { mockTweet } from '@/features/tweets/tests/fixtures'
import { mockBobUser } from '@/features/users/tests/fixtures'

const emptyPage = { items: [], total: 0, page: 1, limit: 20 }

vi.mock('@/api/users/users-api', () => ({
  followUser: vi.fn(async () => ({ following: true })),
  unfollowUser: vi.fn(async () => {}),
  searchUsers: vi.fn(async () => [mockBobUser]),
  getFollowing: vi.fn(async () => ({
    items: [],
    total: 0,
    page: 1,
    limit: 50,
  })),
  getFollowers: vi.fn(async () => ({
    items: [mockBobUser],
    total: 1,
    page: 1,
    limit: 20,
  })),
  getUserTweets: vi.fn(async () => ({
    items: [mockTweet],
    total: 1,
    page: 1,
    limit: 20,
  })),
  updateProfile: vi.fn(async (_username: string, payload: { bio?: string }) => ({
    ...mockAuthResponse.user,
    bio: payload.bio ?? mockAuthResponse.user.bio,
  })),
  getProfile: vi.fn(async () => mockAuthResponse.user),
  getUsers: vi.fn(async () => emptyPage),
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
