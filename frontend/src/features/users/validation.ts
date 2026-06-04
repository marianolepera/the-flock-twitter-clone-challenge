export const BIO_MAX_LENGTH = 160

export function validateBio(bio: string) {
  if (bio.length > BIO_MAX_LENGTH) {
    return `Bio must be ${BIO_MAX_LENGTH} characters or less`
  }

  return undefined
}
