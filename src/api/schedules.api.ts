import apiClient from './client'
import type { TimeSlot } from '../types'

// Backend responds with a wrapper object, not a bare array — unwrapping it
// here keeps every caller's `TimeSlot[]` contract accurate.
interface SlotsResponse {
  date: string
  employeeId: string
  serviceId: string
  durationMinutes: number
  slots: TimeSlot[]
}

export const schedulesApi = {
  slots: (orgId: string, employeeId: string, date: string, serviceId: string) =>
    apiClient
      .get<SlotsResponse>(
        `/organizations/${orgId}/employees/${employeeId}/slots`,
        { params: { date, serviceId } },
      )
      .then((r) => r.data.slots),
}
