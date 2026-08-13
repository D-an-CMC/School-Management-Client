'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { getClasses, getAttendanceSessions, getTimetables } from '@/lib/api'

export function TeacherDashboard() {
  const { user } = useAuth()
  const { selectedSchoolYearId, currentSchoolYear, selectedSemesterId, semesters } = useAcademic()
  const teacherId = (user as any)?.teacherId
  const [classes, setClasses] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [allTimetables, setAllTimetables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? undefined
  const yearSems = effectiveYearId != null
    ? semesters.filter((s: any) => Number(s.school_year_id) === Number(effectiveYearId))
    : []
  const effectiveSemesterId = selectedSemesterId ?? (yearSems.find((s: any) => s.is_active)?.semester_id ?? yearSems[0]?.semester_id)

  const DAY_LABELS: Record<string, string> = {
    Monday: 'Thứ 2', Tuesday: 'Thứ 3', Wednesday: 'Thứ 4',
    Thursday: 'Thứ 5', Friday: 'Thứ 6', Saturday: 'Thứ 7', Sunday: 'CN',
  }
  const todayKey = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
  const todayName = DAY_LABELS[todayKey] || todayKey
  const todayTimetables = allTimetables.filter((t: any) => t.day_of_week === todayKey)

  useEffect(() => {
    if (!teacherId) return
    setLoading(true)
    Promise.all([
      getClasses({ teacherId, limit: 20, schoolYearId: effectiveYearId }),
      getAttendanceSessions({ teacherId, limit: 5 }),
      getTimetables({ teacherId, limit: 200, semesterId: effectiveSemesterId }),
    ])
    .then(([cls, sess, tt]) => {
      setClasses(cls?.data ?? [])
      setSessions(sess?.data ?? [])
      setAllTimetables(tt?.data ?? [])
    })
    .catch(() => {})
    .finally(() => setLoading(false))
  }, [teacherId, effectiveYearId, effectiveSemesterId])

  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-white">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Xin chào, {user?.name} | Giáo viên
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Chào mừng bạn trở lại hệ thống quản lý học tập.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Lớp phụ trách</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{classes.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Tổng học sinh</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Buổi điểm danh</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{sessions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Tiết dạy hôm nay ({todayName})</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{todayTimetables.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Thời khóa biểu hôm nay</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : todayTimetables.length === 0 ? (
            <p className="text-sm text-gray-500">Không có lịch dạy hôm nay</p>
          ) : (
            <div className="space-y-3">
              {todayTimetables.map((tt: any) => (
                <div key={tt.schedule_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {(Array.isArray(tt.subjects) ? tt.subjects[0]?.subject_name : tt.subjects?.subject_name) || 'Môn học'} - Lớp {tt.class_name || (Array.isArray(tt.classes) ? tt.classes[0]?.class_name : tt.classes?.class_name) || tt.class_id}
                    </p>
                    <p className="text-xs text-gray-600">Phòng {tt.room || 'N/A'} • Tiết {tt.period_no}</p>
                  </div>
                  <p className="ml-auto text-xs font-medium text-gray-700">
                    {tt.start_time?.slice(0, 5) || ''} - {tt.end_time?.slice(0, 5) || ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Classes */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Lớp phụ trách</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : classes.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa được phân công lớp</p>
          ) : (
            <div className="space-y-3">
              {classes.slice(0, 5).map((cls: any) => (
                <div key={cls.class_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{cls.class_name}</p>
                    <p className="text-xs text-gray-600">{cls.grade_name} • GV: {cls.homeroom_teacher_name}</p>
                  </div>
                  <span className="text-sm font-bold text-[#0066CC]">{cls.student_count || 0} HS</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
