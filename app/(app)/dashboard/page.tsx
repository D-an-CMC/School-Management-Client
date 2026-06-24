'use client'

import { useAuth } from '@/lib/auth-context'
import { mockSchedule, mockAlerts, mockDashboardStats } from '@/lib/mock-data'
import { StatCard } from '@/components/dashboard/stat-card'
import { ScheduleCard } from '@/components/dashboard/schedule-card'
import { AlertCard } from '@/components/dashboard/alert-card'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, {user?.name} | {user?.role === 'student' ? 'Giáo viên' : user?.role}
        </h1>
        <p className="text-gray-600">Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!</p>
      </div>

      {/* Date */}
      <div className="mb-8 text-sm text-gray-600">
        <span>📅 Thứ Ba, 24 Tháng 10, 2023</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="📅"
          title="Today's Schedule"
          action="View All"
          content={
            <div className="space-y-3">
              {mockSchedule.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{item.time} {item.class}</div>
                    <div className="text-sm text-gray-500">{item.room}</div>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{item.period}</div>
                </div>
              ))}
            </div>
          }
        />

        <StatCard
          icon="✓"
          title="Attendance Status"
          content={
            <div>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0066CC]">93%</div>
                  <div className="text-sm text-gray-600">Present</div>
                </div>
                <div className="w-0.5 h-12 bg-gray-300"></div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>42 students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>3 students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                    <span>45 students</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <StatCard
          icon="🤖"
          title="AI Insights Alert"
          badge="SMART ENGINE"
          content={
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-400'
                      : alert.type === 'danger'
                        ? 'bg-red-50 border-red-400'
                        : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{alert.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{alert.description}</div>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Student Submissions</h2>
          <a href="#" className="text-sm text-[#0066CC] hover:underline">
            View All Submissions
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">STUDENT NAME</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">ASSIGNMENT</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">DATE SUBMITTED</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">STATUS</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">ACTION</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      DH
                    </div>
                    <span className="font-medium">Dặng Hoàng Nam</span>
                  </div>
                </td>
                <td className="px-6 py-4">Giải tích nâng cao - Tuần 8</td>
                <td className="px-6 py-4">Hôm nay, 09:30 AM</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    ✓ SUBMITTED
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-[#0066CC] font-medium hover:underline">
                    Grade Now
                  </a>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      MT
                    </div>
                    <span className="font-medium">Mai Thảo Vy</span>
                  </div>
                </td>
                <td className="px-6 py-4">Bài tập Hình học Oxyz</td>
                <td className="px-6 py-4">Hôm qua, 04:45 PM</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                    ⏳ PENDING REVIEW
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-[#0066CC] font-medium hover:underline">
                    Review
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
