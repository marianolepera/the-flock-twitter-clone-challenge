import { apiClient } from '@/api/client'
import type { Tweet } from '@/types/api.types'

export interface CreateTweetPayload {
  content: string
}

export async function createTweet(payload: CreateTweetPayload) {
  const { data } = await apiClient.post<Tweet>('/tweets', payload)
  return data
}

export async function deleteTweet(tweetId: string) {
  await apiClient.delete(`/tweets/${tweetId}`)
}

export async function likeTweet(tweetId: string) {
  const { data } = await apiClient.post<Tweet>(`/tweets/${tweetId}/like`)
  return data
}

export async function unlikeTweet(tweetId: string) {
  await apiClient.delete(`/tweets/${tweetId}/like`)
}
