'use client'

export default function SystemPermissionsPage() {
  const permissions = [
    { name: 'Admin', icon: '🛡️', description: 'Các quyền cao nhất, cho phép thiết lập toàn bộ module hệ thống.', active: true },
    { name: 'Giáo viên', icon: '👨‍🏫', description: '', active: false },
    { name: 'Học sinh', icon: '👨‍🎓', description: '', active: false },
    { name: 'Phụ huynh', icon: '👨‍👩‍👧', description: '', active: false },
    { name: 'Y tế', icon: '⚕️', description: '', active: false },
    { name: 'Kế toán', icon: '📊', description: '', active: false },
    { name: 'Thiết bị', icon: '🛠️', description: '', active: false },
  ]

  const permissionDetails = [
    { category: 'Nhập điểm', enabled: true },
    { category: 'Quản lý điểm danh cho học sinh trong các tiết học hằng ngày qua thiết bị nhận diện.', enabled: true },
    { category: 'Sửa điểm', enabled: true },
    { category: 'Quyền thay đổi điểm dã lưu trong cơ sở dữ liệu. Mọi thay đổi sẽ được ghi nhận ký.', enabled: true },
    { category: 'Phế duyệt điểm', enabled: true },
    { category: 'Xác nhận bằng điểm cuối kỳ để đưa vào cơ sở dữ liệu học tập của cá lớp.', enabled: false },
    { category: 'Điểm danh Học sinh', enabled: true },
    { category: 'Xác nhận sự có mặt của học sinh trong các tiết học hằng ngày qua thiết bị nhận diện.', enabled: true },
    { category: 'Chốt số điểm danh', enabled: false },
    { category: 'Khoá dữ liệu điểm danh sau khi kết thúc buổi học để gửi báo cáo cho phụ huynh.', enabled: false },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {'HỆ THỐNG > PHÂN QUYỀN'}
        </h1>
        <p className="text-gray-900 mb-4">
          Phân quyền Hệ thống
        </p>
      </div>

      {/* Success Message */}
      <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-2xl">✓</span>
        <div>
          <h3 className="font-semibold text-green-900">Nhật kỳ Bảo mật Hệ thống</h3>
          <p className="text-sm text-green-800">Xin chào, Thầy Hiệu Trưởng - Super Admin. Giám sát toàn diễn các hoạt động hệ thống.</p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">NHÓM VAI TRÒ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {permissions.map((role, index) => (
            <button
              key={index}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                role.active
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <div className="text-3xl mb-2">{role.icon}</div>
              <div className={`font-bold ${role.active ? 'text-blue-900' : 'text-gray-900'}`}>
                {role.name}
              </div>
              {role.description && (
                <p className="text-xs text-gray-900 mt-2">{role.description}</p>
              )}
              <span className={`inline-block mt-3 text-xs px-2 py-1 rounded font-semibold ${
                role.active
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {role.active ? 'Hoạt động' : 'Chưa hoạt động'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Permission Details */}
      <div className="mb-8">
        <div className="mb-4">
          <button className="text-blue-600 text-sm font-medium hover:underline">Chi tiết toàn bộ</button>
        </div>

        <div className="space-y-3">
          {permissionDetails.map((perm, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={perm.enabled}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{perm.category}</h4>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                  perm.enabled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {perm.enabled ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="px-6 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Hủy thay đổi
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          🔒 Lưu cấu hình
        </button>
      </div>
    </div>
  )
}
