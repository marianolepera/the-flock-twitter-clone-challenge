import { Logo } from '@/components/atoms/Logo'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="mb-6 text-3xl font-extrabold">Sign in</h1>
      <LoginForm />
    </div>
  )
}
