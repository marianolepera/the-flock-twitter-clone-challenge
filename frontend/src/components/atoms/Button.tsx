import {
  cloneElement,
  type ButtonHTMLAttributes,
  forwardRef,
  isValidElement,
  type ReactElement,
} from 'react'

import { cn } from '@/lib/cn'

const variants = {
  primary:
    'bg-brand text-brand-foreground hover:bg-brand-hover border border-transparent',
  secondary:
    'bg-foreground text-background hover:opacity-90 border border-transparent',
  outline:
    'border border-border-strong bg-transparent text-foreground hover:bg-surface',
  ghost: 'bg-transparent text-foreground hover:bg-surface',
  danger:
    'bg-danger text-white hover:opacity-90 border border-transparent',
} as const

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
} as const

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  pill?: boolean
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      pill = false,
      asChild = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const classes = cn(
      'inline-flex items-center justify-center gap-2 font-bold transition-opacity',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
      'disabled:cursor-not-allowed disabled:opacity-50',
      pill ? 'rounded-full' : 'rounded-lg',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className,
    )

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>
      return cloneElement(child, {
        className: cn(classes, child.props.className),
      })
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
