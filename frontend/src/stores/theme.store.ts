import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { applyTheme, resolveTheme, type ThemePreference } from '@/lib/theme'

export type { ThemePreference } from '@/lib/theme'

interface ThemeState {
  preference: ThemePreference
  setPreference: (preference: ThemePreference) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (preference) => {
        set({ preference })
        applyTheme(resolveTheme(preference))
      },
      toggleTheme: () => {
        const next = resolveTheme(get().preference) === 'dark' ? 'light' : 'dark'
        get().setPreference(next)
      },
    }),
    {
      name: 'the-flock-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(resolveTheme(state.preference))
        }
      },
    },
  ),
)
