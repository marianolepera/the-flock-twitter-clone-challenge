import { X } from 'lucide-react'

import { cn } from '@/lib/cn'
import { useSnackbarStore } from '@/stores/snackbar.store'

export function Snackbar() {
  const message = useSnackbarStore((s) => s.message)
  const hide = useSnackbarStore((s) => s.hide)

  if (!message) return null

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 z-50 flex justify-center px-4',
        'bottom-20 lg:bottom-6',
      )}
      aria-live="polite"
    >
      <div
        role="status"
        className={cn(
          'pointer-events-auto flex max-w-md items-center gap-3 rounded-xl border border-border',
          'bg-surface-elevated px-4 py-3 shadow-lg transition-opacity duration-200',
        )}
      >
        <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
        <button
          type="button"
          onClick={hide}
          className="cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-surface hover:text-foreground"
          aria-label="Dismiss notification"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  )
}
