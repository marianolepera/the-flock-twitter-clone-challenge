import { type FormEvent, useState } from 'react'

import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import {
  BIO_MAX_LENGTH,
  validateBio,
} from '@/features/users/validation'
import { useUpdateProfile } from '@/hooks/users/useUpdateProfile/useUpdateProfile'
import { formatApiError } from '@/lib/format-api-error'
import { cn } from '@/lib/cn'
import type { User } from '@/types/api.types'

export interface EditProfileBioProps {
  user: User
}

export function EditProfileBio({ user }: EditProfileBioProps) {
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

  function handleSubmit(event: FormEvent) {
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

  if (!isEditing) {
    return (
      <div className="mt-2">
        {user.bio ? (
          <p className="text-sm text-foreground">{user.bio}</p>
        ) : (
          <p className="text-sm text-subtle">No bio yet.</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 cursor-pointer"
          onClick={openEditor}
        >
          Edit bio
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2" noValidate>
      <label htmlFor="profile-bio" className="sr-only">
        Bio
      </label>
      <textarea
        id="profile-bio"
        name="bio"
        rows={3}
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        disabled={updateMutation.isPending}
        placeholder="Tell people about yourself"
        className={cn(
          'w-full resize-none rounded-md border border-border-strong bg-transparent px-3 py-2 text-sm text-foreground outline-none',
          'placeholder:text-subtle focus:border-brand focus:ring-1 focus:ring-brand',
        )}
      />

      <div className="mt-2 flex items-center justify-between gap-3">
        <span
          className={cn(
            'text-xs tabular-nums',
            isOverLimit ? 'text-danger' : 'text-muted',
          )}
        >
          {remaining}
        </span>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            disabled={updateMutation.isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="cursor-pointer"
            disabled={
              updateMutation.isPending || !hasChanges || isOverLimit
            }
          >
            {updateMutation.isPending ? (
              <Spinner size="sm" label="Saving bio" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {fieldError || apiError ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {fieldError ?? apiError}
        </p>
      ) : null}
    </form>
  )
}
