import { X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useSnackbarStore } from '@/stores/snackbar.store'

export function Snackbar() {
  const message = useSnackbarStore((s) => s.message)
  const variant = useSnackbarStore((s) => s.variant)
  const hide = useSnackbarStore((s) => s.hide)

  if (!message) return null

  const isError = variant === 'error'

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4',
        'bottom-20 lg:bottom-6',
      )}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div
        role={isError ? 'alert' : 'status'}
        className={cn(
          'pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-opacity duration-200',
          isError
            ? 'border-danger bg-danger-muted text-danger'
            : 'border-border bg-surface-elevated text-foreground',
        )}
      >
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          type="button"
          onClick={hide}
          className={cn(
            'cursor-pointer rounded-full p-1 transition-colors',
            isError
              ? 'text-danger hover:bg-danger/10'
              : 'text-muted hover:bg-surface hover:text-foreground',
          )}
          aria-label="Dismiss notification"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
