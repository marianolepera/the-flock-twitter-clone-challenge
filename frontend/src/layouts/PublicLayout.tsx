import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
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
