import apiClient from './client'
import type { User } from '../types'

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  dateOfBirth?: string
}

export const usersApi = {
  me: () => apiClient.get<User>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateProfileDto) =>
    apiClient.patch<User>('/users/me', data).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient
      .patch('/users/me/password', { currentPassword, newPassword })
      .then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return apiClient
      .patch<{ avatarUrl: string }>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
