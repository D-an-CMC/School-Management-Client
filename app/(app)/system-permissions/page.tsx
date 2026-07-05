'use client'

import { useState } from 'react'

export default function SystemPermissionsPage() {
  const permissions = [
    { name: 'Admin', icon: '🛡️', description: 'Toàn quyền hệ thống', active: true },
    { name: 'Giáo viên', icon: '👨‍🏫', description: 'Quản lý lớp, điểm danh, điểm', active: false },
    { name: 'Học sinh', icon: '👨‍🎓', description: 'Xem điểm, thời khóa biểu', active: false },
    { name: 'Phụ huynh', icon: '👨‍👩‍👧', description: 'Xem tiến độ con em', active: false },
    { name: 'Y tế', icon: '⚕️', description: 'Quản lý sức khỏe học sinh', active: false },
    { name: 'Kế toán', icon: '📊', description: 'Quản lý học phí', active: false },
  ]

  const permissionDetails = [
    { category: 'Nhập điểm', desc: 'Quyền thay đổi điểm đã lưu. Mọi thay đổi được ghi nhận.', enabled: true },
    { category: 'Quản lý điểm danh', desc: 'Xác nhận sự có mặt học sinh qua thiết bị nhận diện.', enabled: true },
    { category: 'Sửa điểm', desc: '', enabled: true },
    { category: 'Phê duyệt điểm cuối kỳ', desc: 'Xác nhận điểm để đưa vào CSDL học tập lớp.', enabled: false },
    { category: 'Điểm danh HS', desc: '', enabled: true },
    { category: 'Chốt số điểm danh', desc: 'Khóa dữ liệu điểm danh sau tiết học.', enabled: false },
  ]

  const [activeRole, setActiveRole] = useState(0)

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          PHÂN QUYỀN HỆ THỐNG
        </h1>
        <p className="text-xs md:text-sm text-gray-600">
          Cấu hình quyền truy cập cho từng vai trò
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mb-6 lg:mb-8">
        {permissions.map((perm, i) => (
          <button
            key={i}
            onClick={() => setActiveRole(i)}
            className={`p-3 md:p-4 rounded-lg border-2 transition text-center ${
              activeRole === i
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-2xl md:text-3xl block mb-1 md:mb-2">{perm.icon}</span>
            <span className={`text-[10px] md:text-sm font-semibold ${activeRole === i ? 'text-blue-700' : 'text-gray-900'}`}>
              {perm.name}
            </span>
          </button>
        ))}
      </div>

      {/* Active role info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
        <div className="flex items-start gap-2 md:gap-3">
          <span className="text-lg md:text-xl">{permissions[activeRole].icon}</span>
          <div>
            <h3 className="text-sm md:text-base font-semibold text-blue-900">{permissions[activeRole].name}</h3>
            <p className="text-xs md:text-sm text-blue-700 mt-0.5">{permissions[activeRole].description}</p>
          </div>
        </div>
      </div>

      {/* Permission Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">CHI TIẾT QUYỀN</h3>
        <div className="space-y-3 md:space-y-4">
          {permissionDetails.map((perm, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 md:gap-2 py-2 md:py-3 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <div className="text-xs md:text-sm font-medium text-gray-900">{perm.category}</div>
                {perm.desc && <div className="text-[10px] md:text-xs text-gray-600 mt-0.5">{perm.desc}</div>}
              </div>
              <div className="sm:text-right">
                <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold ${
                  perm.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {perm.enabled ? 'ĐÃ BẬT' : 'ĐÃ TẮT'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mt-4 md:mt-6">
          <button className="px-4 md:px-6 py-1.5 md:py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-xs md:text-sm w-full sm:w-auto">
            Hủy
          </button>
          <button className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-xs md:text-sm w-full sm:w-auto">
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}
