export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  search: '/search',
  profile: (username: string) => `/${username}` as const,
  profileMe: '/profile',
} as const
