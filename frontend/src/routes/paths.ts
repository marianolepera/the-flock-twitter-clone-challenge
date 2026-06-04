export const paths = {
  landing: '/',
  login: '/login',
  register: '/register',
  home: '/home',
  notifications: '/notifications',
  search: '/search',
  profileMe: '/profile',
  profile: (username: string) => `/${username}` as const,
} as const
