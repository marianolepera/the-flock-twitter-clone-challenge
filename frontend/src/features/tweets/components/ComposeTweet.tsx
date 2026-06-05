import { ImagePlus, X } from 'lucide-react'

import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useComposeTweet } from '@/features/tweets/hooks/useComposeTweet'
import { cn } from '@/lib/cn'

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
  const {
    user,
    fileInputRef,
    content,
    setContent,
    fieldError,
    apiError,
    imagePreviewUrl,
    remaining,
    isOverLimit,
    canSubmit,
    isPending,
    handleImageSelect,
    handleRemoveImage,
    openFilePicker,
    handleSubmit,
  } = useComposeTweet({ parentTweetId, onTweetNotFound })

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
            disabled={isPending}
            className={cn(
              'w-full resize-none bg-transparent text-lg text-foreground outline-none',
              'placeholder:text-subtle',
            )}
          />

          {imagePreviewUrl ? (
            <div className="relative mt-3 inline-block max-w-full">
              <img
                src={imagePreviewUrl}
                alt="Selected image preview"
                className="max-h-80 rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isPending}
                className={cn(
                  'absolute top-2 right-2 rounded-full bg-background/90 p-1.5 text-foreground',
                  'hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                )}
                aria-label="Remove image"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageSelect}
                aria-label="Add image"
              />
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isPending}
                className={cn(
                  'inline-flex cursor-pointer items-center justify-center rounded-full p-2 text-brand',
                  'hover:bg-brand-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
                aria-label="Add image"
              >
                <ImagePlus className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex items-center gap-3">
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
                disabled={isPending || !canSubmit || isOverLimit}
              >
                {isPending ? (
                  <Spinner size="sm" label="Posting tweet" />
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
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
