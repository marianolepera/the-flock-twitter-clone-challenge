import { useSyncExternalStore } from 'react'

import { useAuthStore } from '@/stores/auth.store'

/** Wait for Zustand persist rehydration before auth redirects. */
export function useAuthHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  )
}
