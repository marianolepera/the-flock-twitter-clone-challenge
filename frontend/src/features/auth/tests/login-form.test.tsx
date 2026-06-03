import '@/features/auth/tests/mock-auth-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { LoginForm } from '@/features/auth/components/LoginForm'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { renderWithProviders } from '@/test/test-utils'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

describe('LoginForm', () => {
  it('shows validation errors when fields are empty', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />, {
      route: paths.login,
      formPath: paths.login,
    })

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
  })

  it('signs in with valid credentials and stores the session', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />, {
      route: paths.login,
      formPath: paths.login,
      withHomeRoute: true,
    })

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe(mockAuthResponse.accessToken)
    })

    expect(useAuthStore.getState().user?.username).toBe('alice')
    expect(await screen.findByRole('heading', { name: /home feed/i })).toBeInTheDocument()
  })

  it('shows an error when credentials are invalid', async () => {
    const user = userEvent.setup()

    renderWithProviders(<LoginForm />, {
      route: paths.login,
      formPath: paths.login,
    })

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid credentials/i)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
