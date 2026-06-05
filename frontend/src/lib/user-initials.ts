const PLACEHOLDER_AVATAR_PATTERN =
  /api\.dicebear\.com\/7\.x\/initials\/svg\?seed=default(?:$|&)/

export function isPlaceholderAvatar(src?: string | null): boolean {
  if (!src || src.trim() === '') return true

  return PLACEHOLDER_AVATAR_PATTERN.test(src)
}

function initialsFromParts(parts: string[]): string | null {
  if (parts.length < 2) return null

  const first = parts[0]?.charAt(0)
  const second = parts[1]?.charAt(0)

  if (!first || !second) return null

  return `${first}${second}`.toUpperCase()
}

export function userInitials(username: string, email?: string): string {
  if (email) {
    const localPart = email.split('@')[0] ?? ''
    const fromEmail = initialsFromParts(
      localPart.split(/[._-]+/).filter(Boolean),
    )
    if (fromEmail) return fromEmail
  }

  const fromUsername = initialsFromParts(
    username.split(/[._-]+/).filter(Boolean),
  )
  if (fromUsername) return fromUsername

  const cleaned = username.replace(/[^a-zA-Z0-9]/g, '')
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2).toUpperCase()
  }

  return cleaned.charAt(0).toUpperCase() || '?'
}
