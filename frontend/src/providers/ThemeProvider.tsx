import { useEffect, type ReactNode } from 'react'

import { applyTheme, resolveTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/theme.store'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const preference = useThemeStore((s) => s.preference)

  useEffect(() => {
    const sync = () => applyTheme(resolveTheme(useThemeStore.getState().preference))

    sync()

    if (preference !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [preference])

  return children
}
