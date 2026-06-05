import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Spinner } from '@/components/atoms/Spinner'
import { useLoginForm } from '@/features/auth/hooks/useLoginForm'
import { paths } from '@/routes/paths'

export function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    fieldErrors,
    apiError,
    isPending,
    handleSubmit,
  } = useLoginForm()

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
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
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
        {isPending ? <Spinner size="sm" label="Signing in" /> : 'Sign in'}
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
