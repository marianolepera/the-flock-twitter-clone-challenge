import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { useRegister } from '@/features/auth/hooks/use-auth-mutations'
import { PASSWORD_HINT, validateRegisterForm } from '@/features/auth/validation'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errors = validateRegisterForm({ email, username, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    registerMutation.mutate(
      {
        email: email.trim(),
        username: username.trim(),
        password,
      },
      {
        onSuccess: () => navigate(paths.home, { replace: true }),
      },
    )
  }

  const apiError = registerMutation.isError
    ? formatApiError(registerMutation.error, 'Could not create account')
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
        disabled={registerMutation.isPending}
      />
      <Input
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={fieldErrors.username}
        hint="3–30 characters; letters, numbers, underscores"
        disabled={registerMutation.isPending}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        hint={PASSWORD_HINT}
        disabled={registerMutation.isPending}
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
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? (
          <Spinner size="sm" label="Creating account" />
        ) : (
          'Sign up'
        )}
      </Button>

      <p className="text-sm text-muted">
        Already have an account?{' '}
        <Link to={paths.login} className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
