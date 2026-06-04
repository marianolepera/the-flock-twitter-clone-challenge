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
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/stores/auth.store'

export function ComposeTweet() {
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
      { content: content.trim() },
      {
        onSuccess: () => setContent(''),
      },
    )
  }

  const apiError = createMutation.isError
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
          size="md"
        />

        <div className="min-w-0 flex-1">
          <label htmlFor="compose-tweet" className="sr-only">
            What&apos;s happening?
          </label>
          <textarea
            id="compose-tweet"
            name="content"
            rows={3}
            placeholder="What's happening?"
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
                'Tweet'
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
