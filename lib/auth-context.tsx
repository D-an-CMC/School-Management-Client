'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { User } from './mock-data'
import { loginApi, getMe } from './api'

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_MAP: Record<string, 'student' | 'teacher' | 'admin'> = {
  Admin: 'admin',
  admin: 'admin',
  GiaoVien: 'teacher',
  teacher: 'teacher',
  HocSinhPhuHuynh: 'student',
  'HocSinh-PhuHuynh': 'student',
  'HocSinh_PhuHuynh': 'student',
  student: 'student',
  'Hoc sinh': 'student',
  'Học sinh': 'student',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    getMe()
      .then((me) => {
        if (me) {
          const role = ROLE_MAP[me.role] || 'student'
          setUser({ id: String(me.id), name: me.name, email: me.email, role })
          setIsLoggedIn(true)
        }
      })
      .catch(() => {
        sessionStorage.removeItem('token')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    const result = await loginApi(email, password)
    if (!result.success || !result.data) {
      throw new Error((result as { error: string }).error || 'Đăng nhập thất bại')
    }
    const { token, user: u } = result.data
    sessionStorage.setItem('token', token)
    const role = ROLE_MAP[u.role] || 'student'
    setUser({ id: String(u.id), name: u.name, email: u.email, role })
    setIsLoggedIn(true)
  }

  const logout = () => {
    sessionStorage.removeItem('token')
    setUser(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
