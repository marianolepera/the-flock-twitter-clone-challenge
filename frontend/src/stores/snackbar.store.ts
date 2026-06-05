import { create } from 'zustand'

const DISMISS_MS = 4000

let dismissTimer: ReturnType<typeof setTimeout> | undefined

export type SnackbarVariant = 'default' | 'error'

interface SnackbarState {
  message: string | null
  variant: SnackbarVariant
  show: (message: string, variant?: SnackbarVariant) => void
  hide: () => void
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  message: null,
  variant: 'default',
  show: (message, variant = 'default') => {
    if (dismissTimer) clearTimeout(dismissTimer)
    set({ message, variant })
    dismissTimer = setTimeout(() => {
      set({ message: null, variant: 'default' })
      dismissTimer = undefined
    }, DISMISS_MS)
  },
  hide: () => {
    if (dismissTimer) clearTimeout(dismissTimer)
    dismissTimer = undefined
    set({ message: null, variant: 'default' })
  },
}))
