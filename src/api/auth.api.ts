import apiClient from './client'
import type { AuthTokens, LoginResponse, User } from '../types'

export interface RegisterDto {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export const authApi = {
  register: (data: RegisterDto) =>
    apiClient.post<AuthTokens>('/auth/register', data).then((r) => r.data),

  login: (data: LoginDto) =>
    apiClient.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
}

export const usersApi = {
  me: () => apiClient.get<User>('/users/me').then((r) => r.data),
}
