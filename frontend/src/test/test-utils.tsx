import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  renderHook,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderOptions,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { paths } from '@/routes/paths'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  formPath?: string
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

interface RenderHookWithProvidersOptions<TProps> extends Omit<
  RenderHookOptions<TProps>,
  'wrapper'
> {
  route?: string
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  {
    route = paths.home,
    ...options
  }: RenderHookWithProvidersOptions<TProps> = {},
): RenderHookResult<TResult, TProps> & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    queryClient,
    ...renderHook(hook, { wrapper: Wrapper, ...options }),
  }
}
