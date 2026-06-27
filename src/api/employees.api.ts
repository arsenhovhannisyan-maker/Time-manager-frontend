import apiClient from './client'
import type { Employee, Service } from '../types'

export const employeesApi = {
  list: (orgId: string) =>
    apiClient
      .get<Employee[]>(`/organizations/${orgId}/employees`)
      .then((r) => r.data),

  get: (orgId: string, employeeId: string) =>
    apiClient
      .get<Employee>(`/organizations/${orgId}/employees/${employeeId}`)
      .then((r) => r.data),

  services: (orgId: string, employeeId: string) =>
    apiClient
      .get<Service[]>(`/organizations/${orgId}/employees/${employeeId}/services`)
      .then((r) => r.data),
}
