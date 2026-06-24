'use client'

import { mockStudents, mockTeachers } from '@/lib/mock-data'

export default function UserManagementPage() {
  const allUsers = [...mockStudents, ...mockTeachers]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, Thầy Hiệu Trưởng - Super Admin
        </h1>
        <p className="text-gray-600">
          Chào mừng bạn quay lại hệ thống quản lý nhân sự chuyên sâu.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">32/35</div>
          <div className="text-sm text-gray-600">Tổng số Nhân viên</div>
          <div className="text-xs text-green-600 mt-2">91.4% diễn ra trực hôm nay</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">2/2</div>
          <div className="text-sm text-gray-600">Phòng Y tế</div>
          <div className="text-xs text-green-600 mt-2">100% sẵn sàng trực cấp cứu</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-orange-600 mb-2">3/4</div>
          <div className="text-sm text-gray-600">Phòng Kế toán</div>
          <div className="text-xs text-yellow-600 mt-2">75.0% (1 nhân sự nghỉ phép)</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">27/29</div>
          <div className="text-sm text-gray-600">Phòng Thiết bị</div>
          <div className="text-xs text-gray-600 mt-2">93.1% đang kiểm kê kho</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm học sinh, mã HS, lớp..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          🔒 Lọc kết quả
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          ➕ Thêm người dùng mới
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">AVATAR</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">MÃ ĐỊNH DANH</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">TÊN NGƯỜI DÙNG</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">EMAIL NGƯỜI DÙNG</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">SĐT PHỤ HUYNH</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">LỚP</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">TIẾT HÔM NAY</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">HOẠT ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.slice(0, 10).map((user, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{user.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {user.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Đang hoạt động
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="text-xs">Tiết 1 - Tiết 5</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 text-lg">⋯</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
        <div>Hiển thị 1-10 trên tổng số 62 nhân viên</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">←</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">→</button>
        </div>
      </div>
    </div>
  )
}
