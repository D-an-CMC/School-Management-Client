'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getMyStudentInfo, getMyGrades, getMyActivities, getMyNotifications } from '@/lib/api'

export function StudentDashboard({ user }: { user: any }) {
  const [info, setInfo] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getMyStudentInfo(),
      getMyGrades(),
      getMyActivities(),
      getMyNotifications({ limit: 5 }),
    ])
      .then(([i, g, a, n]) => {
        setInfo(i)
        setGrades(g ?? [])
        setActivities(a ?? [])
        setNotifs(n?.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const myClass = info?.class_info
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Xin chào, {user?.name} | Học sinh
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Chào mừng bạn trở lại hệ thống quản lý học tập.
        </p>
        <p className="text-xs md:text-sm text-gray-600 mt-1">📅 {today}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Lớp học</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{myClass?.class_name || 'Chưa có'}</p>
          <p className="text-xs text-gray-600">{myClass?.grade_name || ''}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Số môn đã có điểm</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{grades.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Hoạt động sắp tới</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {activities.filter((a: any) => new Date(a.start_datetime) > new Date()).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Grades */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Kết quả học tập</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Đang tải...</p>
          ) : grades.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có điểm</p>
          ) : (
            <div className="space-y-3">
              {grades.slice(0, 5).map((g: any) => (
                <div key={g.result_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{g.subject_name}</p>
                    <p className="text-xs text-gray-600">{g.semester_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0066CC]">ĐTB: {g.dtb_mhk ?? '-'}/10</p>
                    <p className="text-xs text-gray-600">Xếp loại: {g.ranking || 'Chưa có'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Thông báo mới</h2>
          {notifs.length === 0 ? (
            <p className="text-sm text-gray-500">Không có thông báo mới</p>
          ) : (
            <div className="space-y-3">
              {notifs.map((n: any) => (
                <div key={n.notification_id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{n.content?.slice(0, 100)}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {new Date(n.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activities */}
      <div className="mt-4 md:mt-6 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Hoạt động sắp diễn ra</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">Không có hoạt động nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activities.slice(0, 4).map((a: any) => (
              <div key={a.activity_id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
                <p className="font-semibold text-sm text-gray-900">{a.activity_name}</p>
                <p className="text-xs text-gray-600 mt-1">{a.activity_type || 'Hoạt động'}</p>
                <p className="text-xs text-gray-600 mt-1">📅 {new Date(a.start_datetime).toLocaleDateString('vi-VN')}</p>
                <p className="text-xs text-gray-600">📍 {a.location || a.activity_type || 'TBD'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
