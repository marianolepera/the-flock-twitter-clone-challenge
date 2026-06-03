import { apiClient } from '@/api/client'
import type { AuthResponse } from '@/types/api.types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
  return data
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
  return data
}

export async function logout(refreshToken: string) {
  await apiClient.post('/auth/logout', { refreshToken })
}
