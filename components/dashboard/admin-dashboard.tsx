'use client'

import { mockDashboardStats, mockTeachers } from '@/lib/mock-data'
import { StatCard } from './stat-card'

export function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8 bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Xin chào, Thầy Hiệu Trưởng - Hiệu Trưởng</h1>
        <p className="opacity-90">
          Chào mừng thầy trở lại với trung tâm diRu hành thống minh. HS thống AI đã hoàn tất báo cáo phân tích rủi ro cho học kỳ này.
        </p>
        <button className="mt-4 bg-white text-[#0B3D5C] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Xem Báo Cáo AI Mới Nhất
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">{mockDashboardStats.totalStudents}/1500</div>
              <div className="text-sm text-gray-900 mt-1">Tổng hiến diễn Toàn trường</div>
            </div>
            <div className="text-3xl">🎓</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96.6%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">88/90</div>
              <div className="text-sm text-gray-900 mt-1">Tổng Giáo viên</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
          <div className="text-sm text-green-600 font-semibold">97.7% hiệu diễn</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">1300/1340</div>
              <div className="text-sm text-gray-900 mt-1">Tổng Học sinh</div>
            </div>
            <div className="text-3xl">👨‍🎓</div>
          </div>
          <div className="text-sm text-blue-600 font-semibold">97.0% hiệu diễn</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">62/70</div>
              <div className="text-sm text-gray-900 mt-1">Tổng Nhân viên</div>
            </div>
            <div className="text-3xl">👔</div>
          </div>
          <div className="text-sm text-orange-600 font-semibold">88.5% hiệu diễn</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Theo dõi Sức khoẻ & Rủi ro Học thuật AI
              </h3>
              <p className="text-sm text-gray-900">
                Phân tích dữ liệu học tập và hành vi dự đoán Predictive Analytics
              </p>
            </div>

            {/* Performance Trend Chart */}
            <div>
              <div className="text-xs text-gray-600 font-semibold mb-3">TREND: PERFORMANCE STABILITY</div>
              <div className="flex items-end gap-1.5 h-40 bg-gray-50 rounded p-4">
                {[28, 42, 35, 52, 30, 55, 68, 45].map((value, index) => {
                  let barColor = 'bg-blue-300';
                  if (index === 4) barColor = 'bg-red-400';
                  if (index === 7) barColor = 'bg-yellow-400';
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full ${barColor} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${(value / 72) * 100}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 font-semibold mb-2">TỶ LỆ HOÀN THÀNH</div>
                <div className="text-3xl font-bold text-gray-900">94.2%</div>
                <div className="text-sm text-green-600 font-semibold mt-2">+2.1% so với tháng trước</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xs text-gray-600 font-semibold mb-2">HỌC LỰC TỀ TOÀN TRƯỜNG</div>
                <div className="text-3xl font-bold text-gray-900">7.8</div>
                <div className="text-sm text-gray-600 mt-2">Xếp loại: Khá</div>
              </div>
            </div>

            {/* Student Risk Analysis Table */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">DANH SÁCH CẢNH BÁO RỦI RO HỌC THUẬT</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 text-xs">HHC SINH</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 text-xs">LỚP</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 text-xs">MLC ĐỘ RỦI RO</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-900 text-xs">HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Nguyễn Võn Anh', class: '12A1', risk: 'Cao (92%)', color: 'bg-red-100 text-red-700' },
                      { name: 'Trần Thị Bình', class: '11B2', risk: 'Cao (88%)', color: 'bg-red-100 text-red-700' },
                      { name: 'Lê Hoàng Nam', class: '10C4', risk: 'Trung bình (65%)', color: 'bg-yellow-100 text-yellow-700' },
                    ].map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3 text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-gray-900">{item.class}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${item.color}`}>
                            {item.risk}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <button className="text-gray-600 hover:text-gray-900 text-lg">⋯</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="text-blue-600 text-sm font-medium hover:underline mt-3">Chi tiết toàn bộ →</button>
            </div>

            {/* Completion Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">DANH SÁCH CHỈ HUY BÁO RỦI RO HỌC THUẬT</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600 font-semibold mb-2">HHC SINH</div>
                  <div className="text-2xl font-bold text-gray-900">5</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-semibold mb-2">LỚP</div>
                  <div className="text-2xl font-bold text-gray-900">3</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 font-semibold mb-2">MLC ĐỘ RỦI RO</div>
                  <div className="text-2xl font-bold text-gray-900">2</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Nhật ký Hoạt động Chỉ tiêu
              </h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">Chi tiết toàn bộ</button>
            </div>

            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 font-semibold text-gray-900">HHC SINH</th>
                  <th className="text-left py-3 font-semibold text-gray-900">LỚP</th>
                  <th className="text-left py-3 font-semibold text-gray-900">MLC ĐỘ RỦI RO</th>
                  <th className="text-left py-3 font-semibold text-gray-900">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Nguyễn Võn Anh', class: '12A1', risk: 'Cao (92%)' },
                  { name: 'Trần Thị Bình', class: '11B2', risk: 'Cao (88%)' },
                  { name: 'Lê Hoàng Nam', class: '10C4', risk: 'Trung bình (65%)' },
                ].map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full"></div>
                        {item.name}
                      </div>
                    </td>
                    <td className="py-3 text-gray-900">{item.class}</td>
                    <td className="py-3">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          item.risk.startsWith('Cao')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {item.risk}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-gray-600 hover:text-gray-900">⋯</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quạn lý Nhân sự</h3>
            <div className="space-y-4">
              <button className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-3xl mb-2">👥</span>
                <span className="text-sm font-medium text-gray-700">Quản lý Người dùng</span>
              </button>
              <button className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-3xl mb-2">🔐</span>
                <span className="text-sm font-medium text-gray-700">Phân quyền Hệ thống</span>
              </button>
              <button className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-3xl mb-2">⚙️</span>
                <span className="text-sm font-medium text-gray-700">Cấu hình AI</span>
              </button>
              <button className="w-full flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="text-3xl mb-2">📱</span>
                <span className="text-sm font-medium text-gray-700">Nhật ký Bảo mật</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">HOẠT ĐỘNG GẦN ĐÂY</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-semibold text-gray-900">Admin-01 đã cập nhật AI Prompt</div>
                  <div className="text-xs text-gray-900">2 giờ trước</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-semibold text-gray-900">Báo cáo tuần đã được tạo</div>
                  <div className="text-xs text-gray-900">5 giờ trước</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <div className="font-semibold text-gray-900">Phát hiện đụng nhập lạ tại IP 192.168...</div>
                  <div className="text-xs text-gray-900">1 giờ trước</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
