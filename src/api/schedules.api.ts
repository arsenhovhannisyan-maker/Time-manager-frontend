import apiClient from './client'
import type { TimeSlot } from '../types'

export const schedulesApi = {
  slots: (orgId: string, employeeId: string, date: string, serviceId: string) =>
    apiClient
      .get<TimeSlot[]>(
        `/organizations/${orgId}/employees/${employeeId}/slots`,
        { params: { date, serviceId } },
      )
      .then((r) => r.data),
}
