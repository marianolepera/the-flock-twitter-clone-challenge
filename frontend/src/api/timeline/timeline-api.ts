import { apiClient } from '@/api/client'
import type { TimelineFeedResponse } from '@/types/api.types'

export interface TimelineQueryParams {
  cursor?: string
  limit?: number
}

export async function getTimeline(params: TimelineQueryParams = {}) {
  const { data } = await apiClient.get<TimelineFeedResponse>('/timeline', {
    params,
  })
  return data
}
