import apiClient from './client'
import type { Appointment, PaginatedResponse } from '../types'

export interface CreateAppointmentDto {
  organizationId: string
  employeeId: string
  serviceId: string
  date: string
  startTime: string
  notes?: string
}

export interface ListAppointmentsParams {
  page?: number
  limit?: number
  organizationId?: string
}

export const appointmentsApi = {
  create: (data: CreateAppointmentDto) =>
    apiClient.post<Appointment>('/appointments', data).then((r) => r.data),

  list: (params: ListAppointmentsParams = {}) =>
    apiClient
      .get<PaginatedResponse<Appointment>>('/appointments', { params })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  cancel: (id: string, cancelReason?: string) =>
    apiClient
      .patch<Appointment>(`/appointments/${id}/cancel`, { cancelReason })
      .then((r) => r.data),
}
