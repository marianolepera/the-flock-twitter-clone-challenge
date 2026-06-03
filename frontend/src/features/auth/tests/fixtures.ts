import type { AuthResponse, User } from '@/types/api.types'

export const mockUser: User = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'alice@example.com',
  username: 'alice',
  bio: '',
  avatarUrl: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
}

export const mockAuthResponse: AuthResponse = {
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
  user: mockUser,
}
