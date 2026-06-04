import { Home, LogOut, Search, User } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { useLogout } from '@/hooks/auth/useLogout/useLogout'
import { cn } from '@/lib/cn'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'

const navItems = [
  { to: paths.home, label: 'Home', icon: Home, end: true },
  { to: paths.search, label: 'Search', icon: Search, end: true },
  { to: paths.profileMe, label: 'Profile', icon: User, end: true },
] as const

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  className,
}: {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
  className?: string
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-full px-3 py-2.5 text-foreground transition-colors',
          'hover:bg-surface',
          isActive && 'font-bold',
          className,
        )
      }
    >
      <Icon className="size-6 shrink-0" aria-hidden />
      <span className="hidden lg:inline">{label}</span>
      <span className="sr-only lg:hidden">{label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logoutMutation = useLogout()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1280px]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border px-3 py-3 lg:flex">
        <div className="mb-4 px-3 py-2">
          <Logo showWordmark />
        </div>
        <nav className="flex flex-col gap-1" aria-label="Main">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-auto space-y-3 px-3 py-4">
          {user ? (
            <p className="truncate text-sm text-muted">@{user.username}</p>
          ) : null}
          <Button
            variant="ghost"
            fullWidth
            className="justify-start gap-3 px-3"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="size-5 shrink-0" aria-hidden />
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md lg:hidden">
          <Logo />
        </header>

        <main className="flex-1 border-r border-border pb-20 lg:max-w-[600px] lg:pb-0">
          <Outlet />
        </main>
      </div>

      <aside className="hidden flex-1 xl:block" aria-hidden />

      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-background px-2 py-2 lg:hidden"
        aria-label="Mobile"
      >
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            className="flex-col gap-0.5 rounded-xl px-4 py-2 text-xs"
          />
        ))}
      </nav>
    </div>
  )
}
