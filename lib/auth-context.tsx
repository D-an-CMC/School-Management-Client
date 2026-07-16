'use client'

import React, { createContext, useContext, useState } from 'react'
import type { User } from './mock-data'
import { mockCurrentUser, mockTeacher } from './mock-data'

interface AuthContextType {
 user: User | null
 isLoggedIn: boolean
 login: (email: string, password: string, role?: 'student' | 'teacher' | 'admin') => Promise<void>
 logout: () => void
 switchRole: (role: 'student' | 'teacher' | 'admin') => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_MAP: Record<string, 'student' | 'teacher' | 'admin'> = {
 'Admin': 'admin',
 'admin': 'admin',
 'GiaoVien': 'teacher',
 'teacher': 'teacher',
 'HocSinh-PhuHuynh': 'student',
 'student': 'student',
 'Hoc sinh': 'student',
 'Học sinh': 'student',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [user, setUser] = useState<User | null>(null)
 const [isLoggedIn, setIsLoggedIn] = useState(false)

 const mapRole = (roleName?: string): 'student' | 'teacher' | 'admin' => {
  if (!roleName) return 'student'
  return ROLE_MAP[roleName] || 'student'
 }

 const login = async (email: string, password: string, roleName?: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const selectedRole = mapRole(roleName)

  const baseUser =
   selectedRole === 'admin'
    ? { ...mockTeacher, role: 'admin' }
    : selectedRole === 'teacher'
     ? { ...mockTeacher, role: 'teacher' }
     : { ...mockCurrentUser, role: 'student' }

  setUser(baseUser)
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
