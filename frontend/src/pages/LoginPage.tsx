import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { paths } from '@/routes/paths'

export function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="mb-2 text-3xl font-extrabold">Sign in</h1>
      <p className="mb-8 text-muted">Auth form coming in the next commit.</p>
      <Button variant="primary" fullWidth pill disabled>
        Sign in
      </Button>
      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{' '}
        <Link to={paths.register} className="text-brand hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
