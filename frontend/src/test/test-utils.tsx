import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { paths } from '@/routes/paths'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /** Initial URL in MemoryRouter. */
  route?: string
  /** Path where the component under test is mounted. Defaults to `route`. */
  formPath?: string
  /** Also register `/home` for post-auth navigation tests. */
  withHomeRoute?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = paths.login,
    formPath,
    withHomeRoute = false,
    ...options
  }: RenderWithProvidersOptions = {},
) {
  const queryClient = createTestQueryClient()
  const resolvedFormPath = formPath ?? route

  function Wrapper({ children }: { children: ReactNode }) {
    if (withHomeRoute) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={resolvedFormPath} element={children} />
              <Route path={paths.home} element={<h1>Home feed</h1>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      )
    }

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  }
}
