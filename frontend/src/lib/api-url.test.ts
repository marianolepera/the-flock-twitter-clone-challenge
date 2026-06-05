import { describe, expect, it } from 'vitest'

import { mediaUrl } from '@/lib/api-url'

describe('mediaUrl', () => {
  it('returns null for empty paths', () => {
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl('')).toBeNull()
  })

  it('builds an absolute URL from a stored upload path', () => {
    expect(mediaUrl('/uploads/abc.jpg')).toBe(
      'http://localhost:3000/uploads/abc.jpg',
    )
  })
})
