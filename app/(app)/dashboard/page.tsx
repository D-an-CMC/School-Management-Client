'use client'

import { useAuth } from '@/lib/auth-context'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'
import { TeacherDashboard } from '@/components/dashboard/teacher-dashboard'
import { StudentDashboard } from '@/components/dashboard/student-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'student') {
    return <StudentDashboard user={user} />
  }

  return <TeacherDashboard />
}
