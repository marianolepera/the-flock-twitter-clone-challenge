export const userKeys = {
  all: ['users'] as const,
  profile: (username: string) => [...userKeys.all, 'profile', username] as const,
  following: (username: string) => [...userKeys.all, 'following', username] as const,
  followers: (username: string) => [...userKeys.all, 'followers', username] as const,
  search: (query: string) => [...userKeys.all, 'search', query] as const,
}
