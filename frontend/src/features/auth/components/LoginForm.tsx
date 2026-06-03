import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { useLogin } from '@/features/auth/hooks/use-auth-mutations'
import { validateLoginForm } from '@/features/auth/validation'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? paths.home

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors = validateLoginForm({ email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate(from, { replace: true }),
      },
    )
  }

  const apiError = loginMutation.isError
    ? formatApiError(loginMutation.error, 'Could not sign in')
    : null

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={loginMutation.isPending}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={loginMutation.isPending}
      />

      {apiError ? (
        <p className="text-sm text-danger" role="alert">
          {apiError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        pill
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? <Spinner size="sm" label="Signing in" /> : 'Sign in'}
      </Button>

      <p className="text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to={paths.register} className="text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
