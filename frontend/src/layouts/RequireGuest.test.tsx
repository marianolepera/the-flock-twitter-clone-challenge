import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { RequireGuest } from '@/layouts/RequireGuest'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

vi.mock('@/hooks/use-auth-hydrated', () => ({
  useAuthHydrated: vi.fn(() => true),
}))

describe('RequireGuest', () => {
  it('renders guest routes when not authenticated', () => {
    useAuthStore.getState().clearSession()

    render(
      <MemoryRouter initialEntries={[paths.login]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path={paths.login} element={<h1>Login page</h1>} />
          </Route>
          <Route path={paths.home} element={<h1>Home page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
  })

  it('redirects authenticated users away from guest routes', () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    render(
      <MemoryRouter initialEntries={[paths.login]}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path={paths.login} element={<h1>Login page</h1>} />
          </Route>
          <Route path={paths.home} element={<h1>Home page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /home page/i })).toBeInTheDocument()
  })
})
