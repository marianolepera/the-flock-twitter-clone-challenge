import '@/features/users/tests/mock-users-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { updateProfile } from '@/api/users/users-api'
import { EditProfileBio } from '@/features/users/components/EditProfileBio'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { useAuthStore } from '@/stores/auth.store'

describe('EditProfileBio', () => {
  beforeEach(() => {
    useAuthStore.getState().setSession(mockAuthResponse)
    vi.mocked(updateProfile).mockReset()
    vi.mocked(updateProfile).mockImplementation(async (_username, payload) => ({
      ...mockAuthResponse.user,
      bio: payload.bio ?? mockAuthResponse.user.bio,
    }))
  })

  it('opens the editor and saves an updated bio', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <EditProfileBio user={mockAuthResponse.user} />,
    )

    await user.click(screen.getByRole('button', { name: /edit bio/i }))

    const textarea = screen.getByLabelText(/^bio$/i)
    await user.clear(textarea)
    await user.type(textarea, 'Updated bio for tests')
    await user.click(screen.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith('alice', {
        bio: 'Updated bio for tests',
      })
    })

    expect(screen.queryByLabelText(/^bio$/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit bio/i })).toBeInTheDocument()
  })

  it('cancels editing and restores the original bio', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <EditProfileBio user={mockAuthResponse.user} />,
    )

    await user.click(screen.getByRole('button', { name: /edit bio/i }))
    await user.clear(screen.getByLabelText(/^bio$/i))
    await user.type(screen.getByLabelText(/^bio$/i), 'Temporary draft')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByLabelText(/^bio$/i)).not.toBeInTheDocument()
    expect(updateProfile).not.toHaveBeenCalled()
  })
})
