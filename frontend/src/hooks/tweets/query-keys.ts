export const tweetKeys = {
  all: ['tweets'] as const,
  byUser: (username: string) => [...tweetKeys.all, 'user', username] as const,
  thread: (tweetId: string) => [...tweetKeys.all, 'thread', tweetId] as const,
}
