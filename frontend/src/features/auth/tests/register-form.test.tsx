import '@/features/auth/tests/mock-auth-api'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { renderWithProviders } from '@/test/test-utils'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

describe('RegisterForm', () => {
  it('shows validation errors when required fields are invalid', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RegisterForm />, {
      route: paths.register,
      formPath: paths.register,
    })

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/username must be 3–30 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/8–72 characters/i)).toBeInTheDocument()
  })

  it('creates an account and stores the session', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RegisterForm />, {
      route: paths.register,
      formPath: paths.register,
      withHomeRoute: true,
    })

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/username/i), 'new_user')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('new-access-token')
    })

    expect(useAuthStore.getState().user?.username).toBe('new_user')
    expect(await screen.findByRole('heading', { name: /home feed/i })).toBeInTheDocument()
  })

  it('shows an error when the email is already taken', async () => {
    const user = userEvent.setup()

    renderWithProviders(<RegisterForm />, {
      route: paths.register,
      formPath: paths.register,
    })

    await user.type(screen.getByLabelText(/email/i), 'taken@example.com')
    await user.type(screen.getByLabelText(/username/i), 'fresh_user')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/email already in use/i)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
