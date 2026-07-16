'use client'

import { useState, useEffect } from 'react'
import { getStudentStats, getTeacherStats, getRiskStats, getClassesCount, getGradeStats, } from '@/lib/api'

export function AdminDashboard() {
  const [stats, setStats] = useState<{ totalStudents: number; totalTeachers: number; totalClasses: number } | null>(null)
  const [riskStats, setRiskStats] = useState<{ completionRate: number; gpaAverage: number; riskCount: number } | null>(null)
  const [gradeStats, setGradeStats] = useState<{ grade_level: number; class_count: number; student_count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      getStudentStats(),
      getTeacherStats(),
      getRiskStats(),
      getClassesCount(),
      getGradeStats(),
    ])
      .then(([studentStats, teacherStats, riskStatsData, classesCount, gradeStatsData]) => {
        if (cancelled) return
        setStats({
          totalStudents: studentStats?.totalStudents ?? 0,
          totalTeachers: teacherStats?.totalTeachers ?? 0,
          totalClasses: classesCount ?? 0,
        })
        setRiskStats({
          completionRate: riskStatsData?.completionRate ?? 0,
          gpaAverage: riskStatsData?.avgGpa ?? 0,
          riskCount: riskStatsData?.high ?? 0,
        })
        setGradeStats(gradeStatsData || [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] text-white rounded-lg p-4 md:p-6">
        <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Xin chào, Thầy Hiệu Trưởng</h1>
        <p className="text-xs md:text-sm opacity-90 mb-3 md:mb-4">
          AI đã hoàn tất báo cáo phân tích rủi ro cho học kỳ này.
        </p>
        <button className="bg-white text-[#0B3D5C] px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-xs md:text-sm hover:bg-gray-100 transition-colors">
          Xem Báo Cáo AI Mới Nhất
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalStudents ?? 0}</div>
          <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng HS Toàn trường</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalTeachers ?? 0}</div>
          <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng Giáo viên</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalClasses ?? 0}</div>
          <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng Lớp học</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            {/* Header with Title and Warning Badge */}
            <div className="flex items-start justify-between mb-4 md:mb-6">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded text-blue-600 font-bold text-sm md:text-lg">📊</div>
                <div>
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">
                    Theo dõi Sức khỏe & Rủi ro
                  </h3>
                  <p className="text-[10px] md:text-sm text-gray-600 mt-0.5 md:mt-1">
                    Phân tích dữ liệu học tập AI
                  </p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg px-2 md:px-4 py-1 md:py-3 text-center shadow-md flex-shrink-0">
                <div className="text-base md:text-lg font-bold">⚠️ {riskStats?.riskCount ?? 0}</div>
                <div className="text-[9px] md:text-xs font-semibold opacity-90">Rủi ro</div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="text-[10px] md:text-xs text-gray-600 font-semibold tracking-wide mb-1 md:mb-2">TỶ LỆ HOÀN THÀNH</div>
                <div className="text-xl md:text-3xl font-bold text-gray-900 mb-0.5 md:mb-1">{loading ? '...' : riskStats?.completionRate ?? 0}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                <div className="text-[10px] md:text-xs text-gray-600 font-semibold tracking-wide mb-1 md:mb-2">HỌC LỰC TỀ</div>
                <div className="text-xl md:text-3xl font-bold text-gray-900 mb-0.5 md:mb-1">{loading ? '...' : riskStats?.gpaAverage ?? 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Grade Stats Table */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Thống kê theo khối</h3>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full text-xs md:text-sm min-w-[280px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">KHỐI</th>
                    <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">LỚP</th>
                    <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">HS</th>
                  </tr>
                </thead>
                <tbody>
                  {(gradeStats || []).map((g) => (
                    <tr key={g.grade_level} className="border-b border-gray-100">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 font-medium">Khối {g.grade_level}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 text-right">{g.class_count}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 text-right">{g.student_count}</td>
                    </tr>
                  ))}
                  {(!gradeStats || gradeStats.length === 0) && !loading && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">Chưa có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
