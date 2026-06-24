'use client'

import React, { createContext, useContext, useState } from 'react'
import type { User } from './mock-data'
import { mockCurrentUser, mockTeacher } from './mock-data'

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: 'student' | 'teacher' | 'admin') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = async (email: string, password: string) => {
    // Mock login - in production this would call an API
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (email.includes('admin')) {
      setUser(mockTeacher)
    } else {
      setUser(mockCurrentUser)
    }
    setIsLoggedIn(true)
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  const switchRole = (role: 'student' | 'teacher' | 'admin') => {
    if (user) {
      setUser({ ...user, role })
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, switchRole }}>
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
