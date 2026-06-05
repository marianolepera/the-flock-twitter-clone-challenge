import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useParams } from 'react-router-dom'

import type { ProfileTab } from '@/features/users/components/ProfileHeader'
import { useGetProfile } from '@/hooks/users/useGetProfile/useGetProfile'

export function useUserProfilePage() {
  const { username = '' } = useParams<{ username: string }>()
  const [activeTab, setActiveTab] = useState<ProfileTab>('tweets')

  const { data: profile, isLoading, isError, error, refetch } =
    useGetProfile(username)

  const isNotFound = isAxiosError(error) && error.response?.status === 404

  return {
    username,
    activeTab,
    setActiveTab,
    profile,
    isLoading,
    isError,
    isNotFound,
    error,
    refetch,
  }
}
