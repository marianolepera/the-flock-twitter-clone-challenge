import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { mockReplyTweet, mockTweet } from '@/features/tweets/tests/fixtures'
import { tweetKeys } from '@/hooks/tweets/query-keys'
import { updateTweetInCaches } from '@/hooks/tweets/update-tweet-cache'

describe('updateTweetInCaches', () => {
  it('updates likes on tweets inside thread cache', () => {
    const queryClient = new QueryClient()

    queryClient.setQueryData(tweetKeys.thread(mockTweet.id), {
      root: mockTweet,
      replies: [mockReplyTweet],
    })

    updateTweetInCaches(queryClient, mockReplyTweet.id, (tweet) => ({
      ...tweet,
      likedByMe: true,
      likesCount: tweet.likesCount + 1,
    }))

    const thread = queryClient.getQueryData<{
      root: typeof mockTweet
      replies: typeof mockReplyTweet[]
    }>(tweetKeys.thread(mockTweet.id))

    expect(thread?.replies[0]?.likedByMe).toBe(true)
    expect(thread?.replies[0]?.likesCount).toBe(mockReplyTweet.likesCount + 1)
    expect(thread?.root.likedByMe).toBe(mockTweet.likedByMe)
  })

  it('updates likes on the root tweet in thread cache', () => {
    const queryClient = new QueryClient()

    queryClient.setQueryData(tweetKeys.thread(mockTweet.id), {
      root: mockTweet,
      replies: [],
    })

    updateTweetInCaches(queryClient, mockTweet.id, (tweet) => ({
      ...tweet,
      likedByMe: true,
      likesCount: tweet.likesCount + 1,
    }))

    const thread = queryClient.getQueryData<{
      root: typeof mockTweet
      replies: []
    }>(tweetKeys.thread(mockTweet.id))

    expect(thread?.root.likedByMe).toBe(true)
    expect(thread?.root.likesCount).toBe(mockTweet.likesCount + 1)
  })
})
