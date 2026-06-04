import { apiClient } from '@/api/client'
import type {
  FollowResponse,
  PaginatedResponse,
  Tweet,
  User,
} from '@/types/api.types'

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface SearchUsersParams {
  q: string
  limit?: number
}

export interface UpdateProfilePayload {
  username?: string
  email?: string
  bio?: string
  avatarUrl?: string
  currentPassword?: string
  newPassword?: string
}

export async function getUsers(params: PaginationParams = {}) {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/users', {
    params,
  })
  return data
}

export async function searchUsers(params: SearchUsersParams) {
  const { data } = await apiClient.get<User[]>('/users/search', { params })
  return data
}

export async function getProfile(username: string) {
  const { data } = await apiClient.get<User>(`/users/${username}`)
  return data
}

export async function updateProfile(
  username: string,
  payload: UpdateProfilePayload,
) {
  const { data } = await apiClient.patch<User>(`/users/${username}`, payload)
  return data
}

export async function followUser(username: string) {
  const { data } = await apiClient.post<FollowResponse>(
    `/users/${username}/follow`,
  )
  return data
}

export async function unfollowUser(username: string) {
  await apiClient.delete(`/users/${username}/follow`)
}

export async function getFollowers(
  username: string,
  params: PaginationParams = {},
) {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/users/${username}/followers`,
    { params },
  )
  return data
}

export async function getFollowing(
  username: string,
  params: PaginationParams = {},
) {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/users/${username}/following`,
    { params },
  )
  return data
}

export async function getUserTweets(
  username: string,
  params: PaginationParams = {},
) {
  const { data } = await apiClient.get<PaginatedResponse<Tweet>>(
    `/users/${username}/tweets`,
    { params },
  )
  return data
}
