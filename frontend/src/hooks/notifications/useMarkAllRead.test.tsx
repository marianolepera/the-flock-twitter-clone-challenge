import '@/features/notifications/tests/mock-notifications-api'

import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { markAllNotificationsRead } from '@/api/notifications/notifications-api'
import { useMarkAllRead } from '@/hooks/notifications/useMarkAllRead/useMarkAllRead'
import { notificationKeys } from '@/hooks/notifications/query-keys'
import { renderHookWithProviders } from '@/test/test-utils'

describe('useMarkAllRead', () => {
  it('calls the API and invalidates notification queries', async () => {
    const { result, queryClient } = renderHookWithProviders(() =>
      useMarkAllRead(),
    )

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    result.current.mutate()

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(markAllNotificationsRead).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.all,
    })
  })
})
