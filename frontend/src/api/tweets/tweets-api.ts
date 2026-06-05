import { apiClient } from '@/api/client'
import type { Tweet, TweetThreadResponse } from '@/types/api.types'

export interface CreateTweetPayload {
  content?: string
  parentTweetId?: string
  image?: File
}

export async function createTweet(payload: CreateTweetPayload) {
  if (payload.image) {
    const form = new FormData()

    if (payload.content?.trim()) {
      form.append('content', payload.content.trim())
    }

    form.append('image', payload.image)

    if (payload.parentTweetId) {
      form.append('parentTweetId', payload.parentTweetId)
    }

    const { data } = await apiClient.post<Tweet>('/tweets', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data
  }

  const { data } = await apiClient.post<Tweet>('/tweets', {
    content: payload.content?.trim() ?? '',
    ...(payload.parentTweetId ? { parentTweetId: payload.parentTweetId } : {}),
  })

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

export async function getThread(tweetId: string) {
  const { data } = await apiClient.get<TweetThreadResponse>(
    `/tweets/${tweetId}/thread`,
  )
  return data
}
