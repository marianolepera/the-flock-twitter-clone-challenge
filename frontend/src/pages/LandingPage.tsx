import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { Logo } from '@/components/atoms/Logo'
import { paths } from '@/routes/paths'

export function LandingPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-6xl flex-1 lg:grid-cols-2">
      <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
        <div className="mb-8 lg:hidden">
          <Logo linkTo={null} />
        </div>

        <h1 className="mb-10 text-[2.5rem] leading-tight font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          See what&apos;s happening
        </h1>

        <div className="max-w-sm space-y-4">
          <p className="text-lg font-bold">Join The Flock today.</p>

          <Button variant="secondary" size="lg" fullWidth pill asChild>
            <Link to={paths.register}>Create account</Link>
          </Button>

          <p className="text-xs text-muted leading-relaxed">
            By signing up, you agree to the Terms of Service and Privacy Policy.
          </p>

          <div className="flex items-center gap-3 py-2">
            <span className="h-px flex-1 bg-border-strong" />
            <span className="text-sm text-muted">or</span>
            <span className="h-px flex-1 bg-border-strong" />
          </div>

          <p className="text-sm text-muted">Already have an account?</p>
          <Button variant="outline" size="lg" fullWidth pill asChild>
            <Link to={paths.login}>Sign in</Link>
          </Button>
        </div>
      </section>

      <section
        className="relative hidden items-center justify-center overflow-hidden lg:flex"
        aria-hidden
      >
        <Logo size="hero" linkTo={null} />
      </section>
    </div>
  )
}
