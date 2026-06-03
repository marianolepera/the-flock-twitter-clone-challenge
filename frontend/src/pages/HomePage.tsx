import { useAuthStore } from '@/stores/auth.store'

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="border-b border-border px-4 py-6">
      <h1 className="text-xl font-bold">Home</h1>
      {user ? (
        <p className="mt-2 text-muted">
          Signed in as <span className="text-foreground">@{user.username}</span>
        </p>
      ) : null}
    </div>
  )
}
