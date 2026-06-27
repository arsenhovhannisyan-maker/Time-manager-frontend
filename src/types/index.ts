export type RoleName = 'client' | 'employee' | 'organization_admin' | 'super_admin'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  avatarUrl: string | null
  mustChangePassword: boolean
  roles: RoleName[]
  status: string
  createdAt: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  icon: string | null
  isActive: boolean
}

export type OrgStatus = 'active' | 'disabled'
export type BookingMode = 'auto' | 'manual'

export interface Organization {
  id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  logo: string | null
  status: OrgStatus
  bookingMode: BookingMode
  categoryId: string | null
  category: Category | null
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  organizationId: string
  name: string
  description: string | null
  durationMinutes: number
  price: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  userId: string
  organizationId: string
  bio: string | null
  experienceYears: number | null
  isActive: boolean
  user: User
  services?: Service[]
  createdAt: string
  updatedAt: string
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'NO_SHOW'

export interface Appointment {
  id: string
  clientId: string
  organizationId: string
  employeeId: string
  serviceId: string
  date: string
  startTime: string
  endTime: string
  status: AppointmentStatus
  notes: string | null
  cancelReason: string | null
  employee?: Employee
  service?: Service
  organization?: Organization
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface WorkingHour {
  id: string
  employeeId: string
  weekday: number
  startTime: string
  endTime: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse extends AuthTokens {
  mustChangePassword: boolean
}
