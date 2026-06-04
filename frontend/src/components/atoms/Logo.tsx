import { Link } from 'react-router-dom'

import { cn } from '@/lib/cn'
import { paths } from '@/routes/paths'
import { XIcon } from './XIcon'

export interface LogoProps {
  size?: 'sm' | 'lg' | 'hero'
  showWordmark?: boolean
  className?: string
  linkTo?: string | null
}

const iconSizes = {
  sm: 'size-8',
  lg: 'size-12',
  hero: 'size-[min(28vw,20rem)]',
} as const

export function Logo({
  size = 'sm',
  showWordmark = false,
  className,
  linkTo = paths.landing,
}: LogoProps) {
  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-foreground',
        size === 'hero' && 'flex-col gap-4',
        className,
      )}
    >
      <XIcon
        className={cn(iconSizes[size], 'text-foreground', size === 'hero' && 'opacity-20')}
        aria-hidden
      />
      {showWordmark ? (
        <span
          className={cn(
            'font-bold tracking-tight',
            size === 'hero' ? 'sr-only' : 'text-xl',
          )}
        >
          The Flock
        </span>
      ) : null}
    </span>
  )

  if (linkTo === null) {
    return content
  }

  return (
    <Link to={linkTo} className="inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      {content}
    </Link>
  )
}
