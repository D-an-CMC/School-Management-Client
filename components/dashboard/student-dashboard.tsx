'use client'

import { useEffect, useState } from 'react'
import { getMyStudentInfo, getMyGrades, getMyActivities, getMyNotifications, getMyAttendance } from '@/lib/api'

export function StudentDashboard({ user }: { user: any }) {
  const [info, setInfo] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [notifs, setNotifs] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getMyStudentInfo(),
      getMyGrades(),
      getMyActivities(),
      getMyNotifications({ limit: 5 }),
      getMyAttendance(),
    ])
      .then(([i, g, a, n, att]) => {
        setInfo(i)
        setGrades(g ?? [])
        setActivities(a ?? [])
        setNotifs(n?.data ?? [])
        setAttendance(att ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const myClass = info?.class_info
  const todayStr = new Date().toISOString().slice(0, 10)
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  
  const todayAttendance = attendance.filter((a: any) => {
    const d = a.attendance_date || a.session_date
    return d === todayStr
  })

  const upcomingActivities = activities.filter((a: any) => {
    const activityDate = new Date(a.start_datetime);
    activityDate.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return activityDate >= now;
  });

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
            {upcomingActivities.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4 md:space-y-6">
          {/* Today's Attendance */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Trạng thái điểm danh hôm nay</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : todayAttendance.length === 0 ? (
              <div className="p-3 bg-gray-50 rounded-lg text-gray-500 text-sm text-center">
                Hôm nay chưa có dữ liệu điểm danh
              </div>
            ) : (
              <div className="space-y-3">
                {todayAttendance.map((a: any) => (
                  <div key={a.attendance_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        Buổi {a.session === 'AFTERNOON' ? 'Chiều' : 'Sáng'}
                      </p>
                      {a.note && <p className="text-xs text-gray-600 mt-1">{a.note}</p>}
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        a.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 
                        a.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {a.status === 'PRESENT' ? 'Có mặt' : 
                         a.status === 'ABSENT_EXCUSED' ? 'Vắng có phép' :
                         a.status === 'ABSENT_UNEXCUSED' ? 'Vắng không phép' :
                         a.status === 'LATE' ? 'Trễ' : a.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>


      </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Thông báo mới</h2>
          {notifs.length === 0 ? (
            <p className="text-sm text-gray-500">Không có thông báo mới</p>
          ) : (
            <div className="space-y-3">
              {notifs.slice(0, 1).map((n: any) => (
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
        {upcomingActivities.length === 0 ? (
          <p className="text-sm text-gray-500">Không có hoạt động nào sắp tới</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingActivities.slice(0, 4).map((a: any) => (
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
