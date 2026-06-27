import apiClient from './client'
import type { Organization, PaginatedResponse } from '../types'

export interface ListOrgsParams {
  page?: number
  limit?: number
  categoryId?: string
  search?: string
}

export const organizationsApi = {
  list: (params: ListOrgsParams = {}) =>
    apiClient
      .get<PaginatedResponse<Organization>>('/organizations', { params })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Organization>(`/organizations/${id}`).then((r) => r.data),
}
