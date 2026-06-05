import { type FormEvent, useState } from 'react'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useCreateTweet } from '@/hooks/tweets/useCreateTweet/useCreateTweet'
import {
  TWEET_MAX_LENGTH,
  validateTweetContent,
} from '@/features/tweets/validation'
import { formatApiError } from '@/lib/format-api-error'
import { isTweetNotFoundError } from '@/lib/tweet-errors'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth.store'

export interface ComposeTweetProps {
  parentTweetId?: string
  placeholder?: string
  submitLabel?: string
  fieldId?: string
  onTweetNotFound?: () => void
}

export function ComposeTweet({
  parentTweetId,
  placeholder = "What's happening?",
  submitLabel = 'Tweet',
  fieldId = 'compose-tweet',
  onTweetNotFound,
}: ComposeTweetProps) {
  const user = useAuthStore((s) => s.user)
  const createMutation = useCreateTweet()

  const [content, setContent] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const remaining = TWEET_MAX_LENGTH - content.length
  const isOverLimit = remaining < 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const validationError = validateTweetContent(content)
    if (validationError) {
      setFieldError(validationError)
      return
    }

    setFieldError(null)
    createMutation.mutate(
      {
        content: content.trim(),
        ...(parentTweetId ? { parentTweetId } : {}),
      },
      {
        onSuccess: () => setContent(''),
        onError: (error) => {
          if (parentTweetId && isTweetNotFoundError(error)) {
            onTweetNotFound?.()
          }
        },
      },
    )
  }

  const apiError =
    createMutation.isError &&
    !(parentTweetId && isTweetNotFoundError(createMutation.error))
      ? formatApiError(createMutation.error, 'Could not post tweet')
      : null

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-border px-4 py-3"
      noValidate
    >
      <div className="flex gap-3">
        <Avatar
          src={user?.avatarUrl}
          alt={user?.username ?? 'You'}
          email={user?.email}
          size="md"
        />

        <div className="min-w-0 flex-1">
          <label htmlFor={fieldId} className="sr-only">
            {placeholder}
          </label>
          <textarea
            id={fieldId}
            name="content"
            rows={parentTweetId ? 2 : 3}
            placeholder={placeholder}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={createMutation.isPending}
            className={cn(
              'w-full resize-none bg-transparent text-lg text-foreground outline-none',
              'placeholder:text-subtle',
            )}
          />

          <div className="mt-3 flex items-center justify-end gap-3 border-t border-border pt-3">
            <span
              className={cn(
                'text-sm tabular-nums',
                isOverLimit ? 'text-danger' : 'text-muted',
              )}
              aria-live="polite"
            >
              {remaining}
            </span>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              pill
              disabled={
                createMutation.isPending || !content.trim() || isOverLimit
              }
            >
              {createMutation.isPending ? (
                <Spinner size="sm" label="Posting tweet" />
              ) : (
                submitLabel
              )}
            </Button>
          </div>

          {fieldError || apiError ? (
            <p className="mt-2 text-sm text-danger" role="alert">
              {fieldError ?? apiError}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  )
}
