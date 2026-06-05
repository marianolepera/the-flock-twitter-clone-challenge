import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useGetThread } from '@/hooks/tweets/useGetThread/useGetThread'
import { isTweetNotFoundError } from '@/lib/tweet-errors'
import { paths } from '@/routes/paths'
import { useAuthStore } from '@/stores/auth.store'
import { useSnackbarStore } from '@/stores/snackbar.store'

export function useTweetThreadPage() {
  const { tweetId = '' } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((s) => s.user)
  const { data, isLoading, isError, isSuccess, error } = useGetThread(tweetId)

  const showThread = isSuccess && data && !isError
  const threadMissing = isError && isTweetNotFoundError(error)

  useEffect(() => {
    if (!threadMissing) return

    useSnackbarStore.getState().show('This tweet was deleted')
    navigate(paths.home, { replace: true })
  }, [threadMissing, navigate])

  const handleTweetDeleted = () => navigate(paths.home)

  const handleTweetNotFound = () => {
    useSnackbarStore.getState().show('This tweet was deleted')
    navigate(paths.home, { replace: true })
  }

  return {
    currentUser,
    data,
    isLoading,
    isError,
    error,
    showThread,
    threadMissing,
    handleTweetDeleted,
    handleTweetNotFound,
  }
}
