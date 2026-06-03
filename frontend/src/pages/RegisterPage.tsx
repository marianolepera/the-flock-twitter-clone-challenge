import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { paths } from '@/routes/paths'

export function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 py-10">
      <div className="mb-8">
        <Logo />
      </div>
      <h1 className="mb-2 text-3xl font-extrabold">Create your account</h1>
      <p className="mb-8 text-muted">Registration form coming in the next commit.</p>
      <Button variant="primary" fullWidth pill disabled>
        Sign up
      </Button>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to={paths.login} className="text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
