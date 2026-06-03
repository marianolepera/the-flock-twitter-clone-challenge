import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/cn'

const sizes = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const

export interface SpinnerProps {
  size?: keyof typeof sizes
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn('animate-spin text-brand', sizes[size], className)}
    />
  )
}
