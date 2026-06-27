import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { usersApi } from '../api/users.api'
import { authApi } from '../api/auth.api'
import type { User } from '../types'
import type { LoginDto } from '../api/auth.api'
import type { RegisterDto } from '../api/auth.api'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginDto) => Promise<{ mustChangePassword: boolean }>
  register: (data: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      usersApi
        .me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (data: LoginDto) => {
    const res = await authApi.login(data)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    const me = await usersApi.me()
    setUser(me)
    return { mustChangePassword: res.mustChangePassword }
  }

  const register = async (data: RegisterDto) => {
    const res = await authApi.register(data)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    const me = await usersApi.me()
    setUser(me)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const refreshUser = async () => {
    const me = await usersApi.me()
    setUser(me)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
