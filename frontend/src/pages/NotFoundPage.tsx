import { Link } from 'react-router-dom'

import { Button } from '@/components/atoms/Button'
import { paths } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted">This page doesn&apos;t exist.</p>
      <Button variant="primary" pill asChild>
        <Link to={paths.landing}>Back home</Link>
      </Button>
    </div>
  )
}
