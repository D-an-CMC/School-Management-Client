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
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Banner Image */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0B3D5C] via-[#0066CC] to-[#3B82F6] h-32 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">🎓 Trường THCS CMC</h2>
          <p className="text-blue-100">Hệ thống theo dõi học tập thông minh</p>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, {user?.name} | {user?.role === 'student' ? 'Giáo viên' : user?.role}
        </h1>
        <p className="text-gray-900">Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!</p>
      </div>

      {/* Date */}
      <div className="mb-8 text-sm text-gray-900">
        <span>📅 Thứ Ba, 24 Tháng 10, 2023</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="📅"
          title="Lịch học hôm nay"
          action="Xem tất cả"
          content={
            <div className="space-y-3">
              {mockSchedule.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-900">{item.time} {item.class}</div>
                    <div className="text-sm text-gray-700">{item.room}</div>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{item.period}</div>
                </div>
              ))}
            </div>
          }
        />

        <StatCard
          icon="📋"
          title="Trạng thái Điểm danh"
          iconColor="text-blue-600"
          content={
            <div>
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="2"
                    />
                    {/* Green arc - Có mặt: 42/45 = 93.33% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="2"
                      strokeDasharray="93.92 100.53"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Red arc - Vắng: 3/45 = 6.67% */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="6.69 100.53"
                      strokeDashoffset="-93.92"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">93%</div>
                      <div className="text-sm text-gray-600">Có mặt</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-600 shadow-sm"></span>
                      <span className="text-gray-900 font-medium">Có mặt</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-900 font-medium">42 học sinh</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-600 shadow-sm"></span>
                      <span className="text-gray-900 font-medium">Vắng</span>
                    </div>
                    <div className="ml-36">
                      <span className="text-gray-900 font-medium">3 học sinh</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-500 shadow-sm"></span>
                      <span className="text-gray-900 font-medium">Tổng học sinh</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-900 font-medium">45 học sinh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        <StatCard
          icon="🤖"
          title="Cảnh báo AI"
          badge="CÔNG CỤ THÔNG MINH"
          content={
            <div className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border-l-4 ${alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-400'
                    : alert.type === 'danger'
                      ? 'bg-red-50 border-red-400'
                      : 'bg-blue-50 border-blue-400'
                    }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{alert.title}</div>
                  <div className="text-xs text-gray-900 mt-1">{alert.description}</div>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Bài tập gần đây</h2>
          <a href="#" className="text-sm text-[#0066CC] hover:underline">
            Xem tất cả bài tập
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">TÊN HỌC SINH</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">BÀI TẬP</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">NGÀY NỘP</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">TRẠNG THÁI</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang%20Nam"
                      alt="Dặng Hoàng Nam"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">Dặng Hoàng Nam</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">Giải tích nâng cao - Tuần 8</td>
                <td className="px-6 py-4 text-gray-900">Hôm nay, 09:30 AM</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-sm">
                    ✓ ĐÃ NỘP
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-[#0066CC] font-medium hover:underline">
                    Chấm điểm
                  </a>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mai%20Thao%20Vy"
                      alt="Mai Thảo Vy"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">Mai Thảo Vy</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">Bài tập Hình học Oxyz</td>
                <td className="px-6 py-4 text-gray-900">Hôm qua, 04:45 PM</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full shadow-sm">
                    ⏳ CHỜ DUYỆT
                  </span>
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-[#0066CC] font-medium hover:underline">
                    Xem xét
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
