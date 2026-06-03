import { cn } from '@/lib/cn'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
  xl: 'size-20 text-xl',
} as const

export type AvatarSize = keyof typeof sizes

export interface AvatarProps {
  src?: string | null
  alt: string
  size?: AvatarSize
  className?: string
}

function initialsFromAlt(alt: string) {
  return alt
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const initials = initialsFromAlt(alt)

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        'bg-brand-muted font-semibold text-brand',
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  )
}
