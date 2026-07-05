'use client'

import { mockStudents, mockTeachers } from '@/lib/mock-data'

export default function UserManagementPage() {
  const allUsers = [...mockStudents, ...mockTeachers]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Quản lý người dùng
        </h1>
        <p className="text-xs md:text-sm text-gray-900">
          Quản lý nhân sự toàn trường
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-blue-600 mb-0.5 md:mb-2">32/35</div>
          <div className="text-[10px] md:text-sm text-gray-900">Nhân viên</div>
          <div className="text-[10px] md:text-xs text-green-600 mt-1 md:mt-2">91.4% có mặt</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-red-600 mb-0.5 md:mb-2">2/2</div>
          <div className="text-[10px] md:text-sm text-gray-900">Phòng Y tế</div>
          <div className="text-[10px] md:text-xs text-green-600 mt-1 md:mt-2">100% sẵn sàng</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-orange-600 mb-0.5 md:mb-2">3/4</div>
          <div className="text-[10px] md:text-sm text-gray-900">Kế toán</div>
          <div className="text-[10px] md:text-xs text-yellow-600 mt-1 md:mt-2">75% đang làm việc</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-blue-600 mb-0.5 md:mb-2">27/29</div>
          <div className="text-[10px] md:text-sm text-gray-900">Thiết bị</div>
          <div className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">93.1% hoạt động</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6 lg:mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-sm"
          />
        </div>
        <button className="px-3 md:px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-xs md:text-sm">
          🔒 Lọc
        </button>
        <button className="px-3 md:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm">
          ➕ Thêm người dùng
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">AVATAR</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">MÃ</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">TÊN</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden lg:table-cell">EMAIL</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden md:table-cell">SĐT</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden sm:table-cell">LỚP</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">TRẠNG THÁI</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden lg:table-cell">TIẾT HÔM NAY</th>
                <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">HĐ</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.slice(0, 10).map((user, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <div className="w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-[10px] md:text-sm">
                      {user.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 font-mono text-gray-900 text-[10px] md:text-sm">{user.code}</td>
                  <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-gray-900 text-[10px] md:text-sm">{user.name}</td>
                  <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-sm hidden lg:table-cell">{user.email}</td>
                  <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-sm hidden md:table-cell">{user.phone}</td>
                  <td className="px-3 md:px-6 py-2 md:py-4 hidden sm:table-cell">
                    <span className="inline-block px-1.5 md:px-3 py-0.5 md:py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-semibold rounded-full">
                      {user.class}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <span className="inline-block px-1.5 md:px-3 py-0.5 md:py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-semibold rounded-full">
                      Hoạt động
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-xs hidden lg:table-cell">
                    Tiết 1 - 5
                  </td>
                  <td className="px-3 md:px-6 py-2 md:py-4">
                    <button className="text-gray-600 hover:text-gray-900 text-sm md:text-lg">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs md:text-sm text-gray-900">
        <div>Hiển thị 1-10 / 62 người dùng</div>
        <div className="flex gap-1 md:gap-2">
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs md:text-sm">←</button>
          <button className="px-2 md:px-3 py-1 bg-blue-600 text-white rounded font-semibold text-xs md:text-sm">1</button>
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs md:text-sm">2</button>
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs md:text-sm">3</button>
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs md:text-sm">→</button>
        </div>
      </div>
    </div>
  )
}
