import { Moon, Sun } from 'lucide-react'

import { cn } from '@/lib/cn'
import { resolveTheme } from '@/lib/theme'
import { useThemeStore } from '@/stores/theme.store'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const preference = useThemeStore((s) => s.preference)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark = resolveTheme(preference) === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 rounded-full px-3 py-2.5 text-foreground transition-colors',
        'hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        className,
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="size-6 shrink-0" aria-hidden />
      ) : (
        <Moon className="size-6 shrink-0" aria-hidden />
      )}
      {showLabel ? (
        <span className="hidden text-sm font-medium lg:inline">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      ) : null}
    </button>
  )
}
