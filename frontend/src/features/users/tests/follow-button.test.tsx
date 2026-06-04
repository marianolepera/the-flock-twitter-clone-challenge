import '@/features/users/tests/mock-users-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { followUser, unfollowUser } from '@/api/users/users-api'
import { FollowButton } from '@/features/users/components/FollowButton'
import { throwUsersApiError } from '@/features/users/tests/mock-users-api'
import { renderWithProviders } from '@/test/test-utils'

describe('FollowButton', () => {
  beforeEach(() => {
    vi.mocked(followUser).mockReset()
    vi.mocked(unfollowUser).mockReset()
    vi.mocked(followUser).mockResolvedValue({ following: true })
    vi.mocked(unfollowUser).mockResolvedValue(undefined)
  })

  it('follows a user when Follow is clicked', async () => {
    const user = userEvent.setup()
    let resolveFollow!: (value: { following: boolean }) => void

    vi.mocked(followUser).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFollow = resolve
        }),
    )

    renderWithProviders(
      <FollowButton username="bob" isFollowing={false} />,
    )

    await user.click(screen.getByRole('button', { name: /follow @bob/i }))

    expect(
      await screen.findByRole('button', { name: /unfollow @bob/i }),
    ).toBeInTheDocument()
    expect(followUser).toHaveBeenCalledWith('bob', expect.any(Object))

    resolveFollow({ following: true })

    await waitFor(() => {
      expect(followUser).toHaveBeenCalled()
    })
  })

  it('unfollows a user when Following is clicked', async () => {
    const user = userEvent.setup()
    let resolveUnfollow!: () => void

    vi.mocked(unfollowUser).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUnfollow = resolve
        }),
    )

    renderWithProviders(<FollowButton username="bob" isFollowing />)

    await user.click(screen.getByRole('button', { name: /unfollow @bob/i }))

    expect(
      await screen.findByRole('button', { name: /follow @bob/i }),
    ).toBeInTheDocument()
    expect(unfollowUser).toHaveBeenCalledWith('bob', expect.any(Object))

    resolveUnfollow()

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /follow @bob/i }),
      ).toHaveAttribute('aria-pressed', 'false')
    })
  })

  it('reverts to Follow when the follow API fails', async () => {
    const user = userEvent.setup()

    vi.mocked(followUser).mockImplementationOnce(async () => {
      throwUsersApiError(400, 'You cannot follow yourself')
    })

    renderWithProviders(
      <FollowButton username="bob" isFollowing={false} />,
    )

    await user.click(screen.getByRole('button', { name: /follow @bob/i }))

    expect(followUser).toHaveBeenCalledWith('bob', expect.any(Object))
    expect(screen.getByRole('button', { name: /follow @bob/i })).toBeInTheDocument()
  })
})
