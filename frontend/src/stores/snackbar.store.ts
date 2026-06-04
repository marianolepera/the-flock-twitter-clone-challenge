import { create } from 'zustand'

const DISMISS_MS = 4000

let dismissTimer: ReturnType<typeof setTimeout> | undefined

interface SnackbarState {
  message: string | null
  show: (message: string) => void
  hide: () => void
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  message: null,
  show: (message) => {
    if (dismissTimer) clearTimeout(dismissTimer)
    set({ message })
    dismissTimer = setTimeout(() => {
      set({ message: null })
      dismissTimer = undefined
    }, DISMISS_MS)
  },
  hide: () => {
    if (dismissTimer) clearTimeout(dismissTimer)
    dismissTimer = undefined
    set({ message: null })
  },
}))
