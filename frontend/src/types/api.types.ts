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
  parentTweetId: string | null
  likesCount: number
  likedByMe: boolean
  repliesCount: number
  createdAt: string
  updatedAt: string
}

export interface TweetThreadResponse {
  root: Tweet
  replies: Tweet[]
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

export type NotificationType = 'follow' | 'like' | 'reply'

export interface NotificationActor {
  id: string
  username: string
  avatarUrl: string
}

export interface NotificationTweetSnippet {
  id: string
  content: string
}

export interface Notification {
  id: string
  type: NotificationType
  actor: NotificationActor
  tweet: NotificationTweetSnippet | null
  readAt: string | null
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

export interface MarkAllReadResponse {
  updated: number
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
