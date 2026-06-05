import { describe, expect, it } from 'vitest'

import { isPlaceholderAvatar, userInitials } from '@/lib/user-initials'

describe('userInitials', () => {
  it('derives initials from email local part when username is a single token', () => {
    expect(
      userInitials('marianolepera', 'mariano.lepera@example.com'),
    ).toBe('ML')
  })

  it('derives initials from username separators', () => {
    expect(userInitials('mariano.lepera')).toBe('ML')
  })

  it('uses first two username characters as fallback', () => {
    expect(userInitials('alice')).toBe('AL')
    expect(userInitials('bob')).toBe('BO')
  })
})

describe('isPlaceholderAvatar', () => {
  it('treats empty and default dicebear urls as placeholders', () => {
    expect(isPlaceholderAvatar('')).toBe(true)
    expect(isPlaceholderAvatar(null)).toBe(true)
    expect(
      isPlaceholderAvatar(
        'https://api.dicebear.com/7.x/initials/svg?seed=default',
      ),
    ).toBe(true)
  })

  it('keeps custom dicebear and image urls', () => {
    expect(
      isPlaceholderAvatar(
        'https://api.dicebear.com/7.x/initials/svg?seed=alice',
      ),
    ).toBe(false)
    expect(isPlaceholderAvatar('https://example.com/avatar.png')).toBe(false)
  })
})
