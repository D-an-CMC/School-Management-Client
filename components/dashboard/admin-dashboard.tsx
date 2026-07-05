'use client'

import { mockDashboardStats, mockTeachers } from '@/lib/mock-data'
import { StatCard } from './stat-card'
import { HealthRiskChart } from './health-risk-chart'

export function AdminDashboard() {
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">1500</div>
          <div className="text-[10px] md:text-sm text-gray-900 mt-0.5 md:mt-1">Tổng HS Toàn trường</div>
          <div className="text-[10px] md:text-xs text-green-600 font-semibold">96.6%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">88/90</div>
          <div className="text-[10px] md:text-sm text-gray-900 mt-0.5 md:mt-1">Tổng Giáo viên</div>
          <div className="text-[10px] md:text-xs text-green-600 font-semibold">97.7%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">1300</div>
          <div className="text-[10px] md:text-sm text-gray-900 mt-0.5 md:mt-1">Tổng Học sinh</div>
          <div className="text-[10px] md:text-xs text-blue-600 font-semibold">97.0%</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-2xl font-bold text-gray-900">62/70</div>
          <div className="text-[10px] md:text-sm text-gray-900 mt-0.5 md:mt-1">Tổng Nhân viên</div>
          <div className="text-[10px] md:text-xs text-orange-600 font-semibold">88.5%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Charts */}
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
                <div className="text-base md:text-lg font-bold">⚠️ 12</div>
                <div className="text-[9px] md:text-xs font-semibold opacity-90">Rủi ro</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Chart Section */}
              <div className="md:col-span-2">
                <HealthRiskChart />
              </div>

              {/* Stats Section */}
              <div className="space-y-3 md:space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] md:text-xs text-gray-600 font-semibold tracking-wide mb-1 md:mb-3">TỶ LỆ HOÀN THÀNH</div>
                  <div className="text-xl md:text-3xl font-bold text-gray-900 mb-0.5 md:mb-1">94.2%</div>
                  <div className="text-[10px] md:text-sm text-green-600 font-semibold">+2.1%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="text-[10px] md:text-xs text-gray-600 font-semibold tracking-wide mb-1 md:mb-3">HỌC LỰC TỀ</div>
                  <div className="text-xl md:text-3xl font-bold text-gray-900 mb-0.5 md:mb-1">7.8</div>
                  <div className="text-[10px] md:text-sm text-gray-600">Khá</div>
                </div>
              </div>
            </div>

            {/* Student Risk Analysis Table */}
            <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 mb-3 md:mb-4">DANH SÁCH CẢNH BÁO RỦI RO</h4>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-xs md:text-sm min-w-[400px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-gray-900 text-[10px] md:text-xs">HỌC SINH</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-gray-900 text-[10px] md:text-xs">LỚP</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-gray-900 text-[10px] md:text-xs">RỦI RO</th>
                      <th className="text-left py-2 md:py-3 px-2 md:px-3 font-semibold text-gray-900 text-[10px] md:text-xs">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Nguyễn Võn Anh', class: '12A1', risk: 'Cao (92%)', color: 'bg-red-100 text-red-700' },
                      { name: 'Trần Thị Bình', class: '11B2', risk: 'Cao (88%)', color: 'bg-red-100 text-red-700' },
                      { name: 'Lê Hoàng Nam', class: '10C4', risk: 'Trung bình (65%)', color: 'bg-yellow-100 text-yellow-700' },
                    ].map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 md:py-3 px-2 md:px-3 text-gray-900">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`}
                              alt={item.name}
                              className="w-5 h-5 md:w-7 md:h-7 rounded-full object-cover"
                            />
                            <span className="font-medium text-xs md:text-sm">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-3 text-gray-900 text-xs md:text-sm">{item.class}</td>
                        <td className="py-2 md:py-3 px-2 md:px-3">
                          <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold ${item.color}`}>
                            {item.risk}
                          </span>
                        </td>
                        <td className="py-2 md:py-3 px-2 md:px-3">
                          <button className="text-gray-600 hover:text-gray-900 text-base md:text-lg">⋯</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-blue-600 text-[10px] md:text-sm font-medium hover:underline mt-2 md:mt-3">Chi tiết toàn bộ →</button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900">Nhật ký Hoạt động</h3>
              <button className="text-blue-600 text-[10px] md:text-sm font-medium hover:underline">Chi tiết</button>
            </div>
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full text-xs md:text-sm min-w-[400px]">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">HỌC SINH</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">LỚP</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">RỦI RO</th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Nguyễn Võn Anh', class: '12A1', risk: 'Cao (92%)' },
                    { name: 'Trần Thị Bình', class: '11B2', risk: 'Cao (88%)' },
                    { name: 'Lê Hoàng Nam', class: '10C4', risk: 'Trung bình (65%)' },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`}
                            alt={item.name}
                            className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover"
                          />
                          <span className="font-medium text-xs md:text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 text-xs md:text-sm">{item.class}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <span className={`px-1.5 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold ${
                          item.risk.startsWith('Cao') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.risk}
                        </span>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <button className="text-gray-600 hover:text-gray-900 text-sm md:text-base">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-4 md:space-y-6 mt-4 lg:mt-0">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quản lý Nhân sự</h3>
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <button className="flex flex-col items-center justify-center py-3 md:py-4 px-2 md:px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-xl md:text-3xl mb-1 md:mb-2">👥</span>
                <span className="text-[10px] md:text-sm font-medium text-gray-700">Người dùng</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 md:py-4 px-2 md:px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-xl md:text-3xl mb-1 md:mb-2">🔐</span>
                <span className="text-[10px] md:text-sm font-medium text-gray-700">Phân quyền</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 md:py-4 px-2 md:px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-xl md:text-3xl mb-1 md:mb-2">⚙️</span>
                <span className="text-[10px] md:text-sm font-medium text-gray-700">Cấu hình AI</span>
              </button>
              <button className="flex flex-col items-center justify-center py-3 md:py-4 px-2 md:px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-xl md:text-3xl mb-1 md:mb-2">🔒</span>
                <span className="text-[10px] md:text-sm font-medium text-gray-700">Bảo mật</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 md:p-6">
            <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">HOẠT ĐỘNG GẦN ĐÂY</h3>
            <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full mt-1 md:mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs md:text-sm">Admin-01 đã cập nhật AI Prompt</div>
                  <div className="text-[10px] md:text-xs text-gray-500">2 giờ trước</div>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-500 rounded-full mt-1 md:mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs md:text-sm">Báo cáo tuần đã được tạo</div>
                  <div className="text-[10px] md:text-xs text-gray-500">5 giờ trước</div>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-500 rounded-full mt-1 md:mt-1.5 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-xs md:text-sm">Phát hiện đăng nhập lạ</div>
                  <div className="text-[10px] md:text-xs text-gray-500">1 giờ trước</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
