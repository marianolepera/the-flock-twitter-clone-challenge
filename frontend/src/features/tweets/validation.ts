export const TWEET_MAX_LENGTH = 280

export function validateTweetContent(content: string) {
  const trimmed = content.trim()

  if (!trimmed) {
    return 'Tweet cannot be empty'
  }

  if (trimmed.length > TWEET_MAX_LENGTH) {
    return `Tweet must be ${TWEET_MAX_LENGTH} characters or less`
  }

  return undefined
}
