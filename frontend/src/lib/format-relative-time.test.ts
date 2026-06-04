import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatRelativeTime } from '@/lib/format-relative-time'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-06-04T12:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns now for invalid dates', () => {
    expect(formatRelativeTime('not-a-date')).toBe('now')
  })

  it('returns now for future timestamps', () => {
    expect(formatRelativeTime('2024-06-04T12:01:00.000Z')).toBe('now')
  })

  it('formats seconds, minutes, hours, and days', () => {
    expect(formatRelativeTime('2024-06-04T11:59:30.000Z')).toBe('30s')
    expect(formatRelativeTime('2024-06-04T11:45:00.000Z')).toBe('15m')
    expect(formatRelativeTime('2024-06-04T09:00:00.000Z')).toBe('3h')
    expect(formatRelativeTime('2024-06-02T12:00:00.000Z')).toBe('2d')
  })
})
