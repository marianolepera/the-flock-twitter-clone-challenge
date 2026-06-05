import { type SubmitEvent, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { validateLoginForm } from '@/features/auth/validation'
import { useLogin } from '@/hooks/auth/useLogin/useLogin'
import { formatApiError } from '@/lib/format-api-error'
import { paths } from '@/routes/paths'

export function useLoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? paths.home

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    const errors = validateLoginForm({ email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate(redirectTo, { replace: true }),
      },
    )
  }

  const apiError = loginMutation.isError
    ? formatApiError(loginMutation.error, 'Could not sign in')
    : null

  return {
    email,
    setEmail,
    password,
    setPassword,
    fieldErrors,
    apiError,
    isPending: loginMutation.isPending,
    handleSubmit,
  }
}
