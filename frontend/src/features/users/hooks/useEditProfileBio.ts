import { type SubmitEvent, useState } from 'react'

import { BIO_MAX_LENGTH, validateBio } from '@/features/users/validation'
import { useUpdateProfile } from '@/hooks/users/useUpdateProfile/useUpdateProfile'
import { formatApiError } from '@/lib/format-api-error'
import type { User } from '@/types/api.types'

export function useEditProfileBio(user: User) {
  const updateMutation = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(user.bio)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const remaining = BIO_MAX_LENGTH - bio.length
  const isOverLimit = remaining < 0
  const hasChanges = bio !== user.bio

  function openEditor() {
    setBio(user.bio)
    setFieldError(null)
    setIsEditing(true)
  }

  function handleCancel() {
    setBio(user.bio)
    setFieldError(null)
    setIsEditing(false)
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const validationError = validateBio(bio)
    if (validationError) {
      setFieldError(validationError)
      return
    }

    setFieldError(null)
    updateMutation.mutate(
      {
        username: user.username,
        payload: { bio: bio.trim() },
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    )
  }

  const apiError = updateMutation.isError
    ? formatApiError(updateMutation.error, 'Could not update profile')
    : null

  return {
    isEditing,
    bio,
    setBio,
    fieldError,
    apiError,
    remaining,
    isOverLimit,
    hasChanges,
    isPending: updateMutation.isPending,
    openEditor,
    handleCancel,
    handleSubmit,
  }
}
