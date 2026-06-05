import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { PASSWORD_HINT } from '@/features/auth/validation'
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm'
import { paths } from '@/routes/paths'

export function RegisterForm() {
  const {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    fieldErrors,
    apiError,
    isPending,
    handleSubmit,
  } = useRegisterForm()

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
        disabled={isPending}
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
        disabled={isPending}
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
        disabled={isPending}
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
        disabled={isPending}
      >
        {isPending ? (
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
