import apiClient from './client'

export interface CreateContactMessageDto {
  name: string
  email: string
  subject?: string
  message: string
}

export const contactApi = {
  send: (data: CreateContactMessageDto) =>
    apiClient.post('/contact', data).then((r) => r.data),
}
