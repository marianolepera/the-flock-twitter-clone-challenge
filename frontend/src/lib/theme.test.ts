import { beforeEach, describe, expect, it, vi } from 'vitest'

import { applyTheme, resolveTheme } from '@/lib/theme'

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('resolveTheme returns explicit light and dark', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('applyTheme toggles dark class on documentElement', () => {
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('resolveTheme uses system preference when set to system', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )

    expect(resolveTheme('system')).toBe('dark')
  })
})
