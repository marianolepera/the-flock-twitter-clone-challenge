import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { RequireAuth } from '@/layouts/RequireAuth'
import { mockAuthResponse } from '@/features/auth/tests/fixtures'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

vi.mock('@/hooks/use-auth-hydrated', () => ({
  useAuthHydrated: vi.fn(() => true),
}))

describe('RequireAuth', () => {
  it('renders child routes when authenticated', () => {
    useAuthStore.getState().setSession(mockAuthResponse)

    render(
      <MemoryRouter initialEntries={[paths.home]}>
        <Routes>
          <Route path={paths.login} element={<h1>Login page</h1>} />
          <Route element={<RequireAuth />}>
            <Route path={paths.home} element={<h1>Protected home</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /protected home/i })).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    useAuthStore.getState().clearSession()

    render(
      <MemoryRouter initialEntries={[paths.home]}>
        <Routes>
          <Route path={paths.login} element={<h1>Login page</h1>} />
          <Route element={<RequireAuth />}>
            <Route path={paths.home} element={<h1>Protected home</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /login page/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /protected home/i })).not.toBeInTheDocument()
  })
})
