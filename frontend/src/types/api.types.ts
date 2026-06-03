/** Shared API types — aligned with backend responses. */

export interface User {
  id: string
  email: string
  username: string
  bio: string
  avatarUrl: string
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

export type RefreshTokenResponse = AuthTokens

export interface ApiErrorBody {
  statusCode: number
  message: string | string[]
  error?: string
}
