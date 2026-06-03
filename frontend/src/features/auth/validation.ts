/** Mirrors backend `PASSWORD_REGEX` in common/password.validation.ts */
export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,72}$/

export const PASSWORD_HINT =
  '8–72 characters, one uppercase letter, and one special character'

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

export function validateRegisterForm(values: {
  email: string
  username: string
  password: string
}) {
  const errors: Partial<Record<'email' | 'username' | 'password' | 'form', string>> =
    {}

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  }

  const username = values.username.trim()
  if (username.length < 3 || username.length > 30) {
    errors.username = 'Username must be 3–30 characters'
  } else if (!USERNAME_REGEX.test(username)) {
    errors.username = 'Letters, numbers, and underscores only'
  }

  if (!PASSWORD_REGEX.test(values.password)) {
    errors.password = PASSWORD_HINT
  }

  return errors
}

export function validateLoginForm(values: { email: string; password: string }) {
  const errors: Partial<Record<'email' | 'password' | 'form', string>> = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  }
  if (!values.password) {
    errors.password = 'Password is required'
  }

  return errors
}
