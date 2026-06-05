import { type ChangeEvent, type SubmitEvent, useEffect, useMemo, useRef, useState } from 'react'

import {
  TWEET_MAX_LENGTH,
  validateTweetContent,
} from '@/features/tweets/validation'
import { useCreateTweet } from '@/hooks/tweets/useCreateTweet/useCreateTweet'
import { formatApiError } from '@/lib/format-api-error'
import { isTweetNotFoundError } from '@/lib/tweet-errors'
import { useAuthStore } from '@/stores/auth.store'
import { useSnackbarStore } from '@/stores/snackbar.store'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

export interface UseComposeTweetOptions {
  parentTweetId?: string
  onTweetNotFound?: () => void
}

export function useComposeTweet({
  parentTweetId,
  onTweetNotFound,
}: UseComposeTweetOptions = {}) {
  const user = useAuthStore((s) => s.user)
  const createMutation = useCreateTweet()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)

  const remaining = TWEET_MAX_LENGTH - content.length
  const isOverLimit = remaining < 0
  const canSubmit = Boolean(content.trim() || image)

  const imagePreviewUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  )

  useEffect(() => {
    if (!imagePreviewUrl) return

    return () => {
      URL.revokeObjectURL(imagePreviewUrl)
    }
  }, [imagePreviewUrl])

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFieldError('Only image files are allowed')
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      useSnackbarStore
        .getState()
        .show('Image must be 5 MB or smaller', 'error')
      return
    }

    setFieldError(null)
    setImage(file)
  }

  function handleRemoveImage() {
    setImage(null)
    setFieldError(null)
  }

  function resetForm() {
    setContent('')
    setImage(null)
    setFieldError(null)
  }

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const trimmed = content.trim()

    if (!trimmed && !image) {
      setFieldError('Tweet cannot be empty')
      return
    }

    if (trimmed) {
      const validationError = validateTweetContent(content)
      if (validationError) {
        setFieldError(validationError)
        return
      }
    }

    setFieldError(null)
    createMutation.mutate(
      {
        content: trimmed,
        ...(image ? { image } : {}),
        ...(parentTweetId ? { parentTweetId } : {}),
      },
      {
        onSuccess: () => resetForm(),
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

  return {
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
    isPending: createMutation.isPending,
    handleImageSelect,
    handleRemoveImage,
    openFilePicker,
    handleSubmit,
  }
}
