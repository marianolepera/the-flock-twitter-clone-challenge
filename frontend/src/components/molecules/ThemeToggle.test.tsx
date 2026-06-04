import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { useThemeStore } from '@/stores/theme.store'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ preference: 'light' })
    document.documentElement.classList.remove('dark')
  })

  it('switches to dark mode when clicked from light', async () => {
    const user = userEvent.setup()

    render(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button'))

    expect(useThemeStore.getState().preference).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(
      screen.getByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument()
  })
})
