import { cn } from '@/lib/cn'
import { isPlaceholderAvatar, userInitials } from '@/lib/user-initials'

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
  email?: string
  size?: AvatarSize
  className?: string
}

export function Avatar({
  src,
  alt,
  email,
  size = 'md',
  className,
}: AvatarProps) {
  const initials = userInitials(alt, email)
  const showImage = src && !isPlaceholderAvatar(src)

  if (showImage) {
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
