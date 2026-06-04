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

export interface TweetAuthor {
  id: string
  username: string
  avatarUrl: string
}

export interface Tweet {
  id: string
  content: string
  authorId: string
  author: TweetAuthor
  likesCount: number
  likedByMe: boolean
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface TimelineFeedResponse {
  items: Tweet[]
  hasMore: boolean
  nextCursor: string | null
}

export interface FollowResponse {
  following: boolean
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
