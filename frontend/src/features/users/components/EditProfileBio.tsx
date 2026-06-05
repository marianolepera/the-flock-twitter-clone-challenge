import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import { useEditProfileBio } from '@/features/users/hooks/useEditProfileBio'
import { cn } from '@/lib/cn'
import type { User } from '@/types/api.types'

export interface EditProfileBioProps {
  user: User
}

export function EditProfileBio({ user }: EditProfileBioProps) {
  const {
    isEditing,
    bio,
    setBio,
    fieldError,
    apiError,
    remaining,
    isOverLimit,
    hasChanges,
    isPending,
    openEditor,
    handleCancel,
    handleSubmit,
  } = useEditProfileBio(user)

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
        disabled={isPending}
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
            disabled={isPending}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="cursor-pointer"
            disabled={isPending || !hasChanges || isOverLimit}
          >
            {isPending ? (
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
