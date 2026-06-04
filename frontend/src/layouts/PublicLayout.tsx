import { Outlet } from 'react-router-dom'

import { ThemeToggle } from '@/components/molecules/ThemeToggle'

export function PublicLayout() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <div className="absolute right-4 top-4 z-10 sm:right-8">
        <ThemeToggle />
      </div>
      <Outlet />
      <footer className="mt-auto border-t border-border px-4 py-6 sm:px-8">
        <nav
          className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-3 gap-y-2 text-xs text-muted"
          aria-label="Footer"
        >
          <span>About</span>
          <span>Help</span>
          <span>Terms</span>
          <span>Privacy</span>
          <span className="w-full text-center sm:w-auto">© {new Date().getFullYear()} The Flock</span>
        </nav>
      </footer>
    </div>
  )
}
