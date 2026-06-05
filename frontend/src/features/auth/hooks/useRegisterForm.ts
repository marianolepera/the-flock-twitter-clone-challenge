import { type SubmitEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { validateRegisterForm } from '@/features/auth/validation'
import { useRegister } from '@/hooks/auth/useRegister/useRegister'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

export function useRegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const errors = validateRegisterForm({ email, username, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    registerMutation.mutate(
      {
        email: email.trim(),
        username: username.trim(),
        password,
      },
      {
        onSuccess: () => navigate(paths.home, { replace: true }),
      },
    )
  }

  const apiError = registerMutation.isError
    ? formatApiError(registerMutation.error, 'Could not create account')
    : null

  return {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    fieldErrors,
    apiError,
    isPending: registerMutation.isPending,
    handleSubmit,
  }
}
