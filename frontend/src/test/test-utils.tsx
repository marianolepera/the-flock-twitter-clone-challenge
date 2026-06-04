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

import { Snackbar } from '@/components/molecules/Snackbar'
import { paths } from '@/routes/paths'
import { useSnackbarStore } from '@/stores/snackbar.store'
import { useThemeStore } from '@/stores/theme.store'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function resetSnackbarStore() {
  useSnackbarStore.getState().hide()
}

export function resetThemeStore() {
  useThemeStore.setState({ preference: 'light' })
  document.documentElement.classList.remove('dark')
  document.documentElement.style.colorScheme = 'light'
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
    const shell = (
      <>
        {children}
        <Snackbar />
      </>
    )

    if (withHomeRoute) {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path={resolvedFormPath} element={shell} />
              <Route path={paths.home} element={<h1>Home feed</h1>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      )
    }

    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{shell}</MemoryRouter>
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
