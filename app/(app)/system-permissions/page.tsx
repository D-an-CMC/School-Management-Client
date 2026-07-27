'use client'

import { useState, useMemo } from 'react'

interface PermissionItem {
  id: string
  label: string
  enabled: boolean
}

interface ModulePermission {
  id: string
  title: string
  icon: string
  enabled: boolean
  items: PermissionItem[]
}

interface RoleData {
  id: string
  name: string
  roleCode: string
  icon: string
  headerIcon: string
  note: string
  lastUpdated: string
  modules: ModulePermission[]
}

const INITIAL_ROLES: RoleData[] = [
  {
    id: 'admin',
    name: 'Quản trị viên (Admin)',
    roleCode: 'ROLE_001',
    icon: 'admin_panel_settings',
    headerIcon: 'shield_person',
    note: 'Nhóm Admin có toàn quyền truy cập hệ thống, bao gồm quản lý người dùng và cấu hình bảo mật.',
    lastUpdated: '12/10/2023 15:45 bởi Admin_01',
    modules: [
      {
        id: 'grading',
        title: 'Quản lý điểm số',
        icon: 'grade',
        enabled: true,
        items: [
          { id: 'g1', label: 'Nhập điểm thành phần', enabled: true },
          { id: 'g2', label: 'Chỉnh sửa điểm đã khóa', enabled: true },
          { id: 'g3', label: 'Phê duyệt bảng điểm tổng kết', enabled: true },
          { id: 'g4', label: 'Xuất báo cáo học thuật', enabled: true },
        ],
      },
      {
        id: 'attendance',
        title: 'Điểm danh & Chuyên cần',
        icon: 'fact_check',
        enabled: true,
        items: [
          { id: 'a1', label: 'Chốt sổ điểm danh ngày', enabled: true },
          { id: 'a2', label: 'Xác nhận đơn xin nghỉ phép', enabled: true },
          { id: 'a3', label: 'Gửi thông báo vắng mặt tự động', enabled: true },
          { id: 'a4', label: 'Truy xuất lịch sử quét thẻ', enabled: false },
        ],
      },
      {
        id: 'finance',
        title: 'Báo cáo tài chính & Học phí',
        icon: 'analytics',
        enabled: true,
        items: [
          { id: 'f1', label: 'Xem dòng tiền tổng thể', enabled: true },
          { id: 'f2', label: 'Miễn giảm học phí đặc biệt', enabled: true },
          { id: 'f3', label: 'Đối soát thanh toán ngân hàng', enabled: true },
          { id: 'f4', label: 'Xóa hóa đơn đã phát hành', enabled: false },
        ],
      },
      {
        id: 'iot',
        title: 'Cấu hình thiết bị IoT',
        icon: 'settings_input_component',
        enabled: true,
        items: [
          { id: 'i1', label: 'Đăng ký thiết bị mới', enabled: true },
          { id: 'i2', label: 'Cập nhật Firmware từ xa', enabled: true },
          { id: 'i3', label: 'Thiết lập ngưỡng cảnh báo', enabled: true },
          { id: 'i4', label: 'Reset cấu hình mạng', enabled: true },
        ],
      },
    ],
  },
  {
    id: 'teacher',
    name: 'Giảng viên / Giáo viên',
    roleCode: 'ROLE_002',
    icon: 'school',
    headerIcon: 'school',
    note: 'Nhóm Giáo viên có quyền nhập điểm, quản lý điểm danh và xem lịch giảng dạy của bộ môn.',
    lastUpdated: '10/10/2023 09:30 bởi Admin_01',
    modules: [
      {
        id: 'grading',
        title: 'Quản lý điểm số',
        icon: 'grade',
        enabled: true,
        items: [
          { id: 'g1', label: 'Nhập điểm thành phần', enabled: true },
          { id: 'g2', label: 'Chỉnh sửa điểm đã khóa', enabled: false },
          { id: 'g3', label: 'Phê duyệt bảng điểm tổng kết', enabled: false },
          { id: 'g4', label: 'Xuất báo cáo học thuật', enabled: true },
        ],
      },
      {
        id: 'attendance',
        title: 'Điểm danh & Chuyên cần',
        icon: 'fact_check',
        enabled: true,
        items: [
          { id: 'a1', label: 'Chốt sổ điểm danh ngày', enabled: true },
          { id: 'a2', label: 'Xác nhận đơn xin nghỉ phép', enabled: true },
          { id: 'a3', label: 'Gửi thông báo vắng mặt tự động', enabled: false },
          { id: 'a4', label: 'Truy xuất lịch sử quét thẻ', enabled: false },
        ],
      },
      {
        id: 'finance',
        title: 'Báo cáo tài chính & Học phí',
        icon: 'analytics',
        enabled: false,
        items: [
          { id: 'f1', label: 'Xem dòng tiền tổng thể', enabled: false },
          { id: 'f2', label: 'Miễn giảm học phí đặc biệt', enabled: false },
          { id: 'f3', label: 'Đối soát thanh toán ngân hàng', enabled: false },
          { id: 'f4', label: 'Xóa hóa đơn đã phát hành', enabled: false },
        ],
      },
      {
        id: 'iot',
        title: 'Cấu hình thiết bị IoT',
        icon: 'settings_input_component',
        enabled: false,
        items: [
          { id: 'i1', label: 'Đăng ký thiết bị mới', enabled: false },
          { id: 'i2', label: 'Cập nhật Firmware từ xa', enabled: false },
          { id: 'i3', label: 'Thiết lập ngưỡng cảnh báo', enabled: false },
          { id: 'i4', label: 'Reset cấu hình mạng', enabled: false },
        ],
      },
    ],
  },
  {
    id: 'student',
    name: 'Học sinh ',
    roleCode: 'ROLE_003',
    icon: 'person',
    headerIcon: 'person',
    note: 'Nhóm Học sinh chỉ có quyền truy cập thông tin cá nhân, xem điểm số và thời khóa biểu.',
    lastUpdated: '05/10/2023 14:15 bởi Admin_02',
    modules: [
      {
        id: 'grading',
        title: 'Quản lý điểm số',
        icon: 'grade',
        enabled: true,
        items: [
          { id: 'g1', label: 'Xem bảng điểm thành phần', enabled: true },
          { id: 'g2', label: 'Tải kết quả học tập PDF', enabled: true },
          { id: 'g3', label: 'Gửi yêu cầu phúc khảo', enabled: true },
          { id: 'g4', label: 'Xuất báo cáo học thuật', enabled: false },
        ],
      },
      {
        id: 'attendance',
        title: 'Điểm danh & Chuyên cần',
        icon: 'fact_check',
        enabled: true,
        items: [
          { id: 'a1', label: 'Xem lịch sử điểm danh', enabled: true },
          { id: 'a2', label: 'Gửi đơn xin nghỉ phép', enabled: true },
          { id: 'a3', label: 'Nhận thông báo chuyên cần', enabled: true },
          { id: 'a4', label: 'Truy xuất lịch sử quét thẻ', enabled: true },
        ],
      },
      {
        id: 'finance',
        title: 'Báo cáo tài chính & Học phí',
        icon: 'analytics',
        enabled: true,
        items: [
          { id: 'f1', label: 'Xem thông báo học phí', enabled: true },
          { id: 'f2', label: 'Thanh toán trực tuyến', enabled: true },
          { id: 'f3', label: 'Xem hóa đơn điện tử', enabled: true },
          { id: 'f4', label: 'Xóa hóa đơn đã phát hành', enabled: false },
        ],
      },
      {
        id: 'iot',
        title: 'Cấu hình thiết bị IoT',
        icon: 'settings_input_component',
        enabled: false,
        items: [
          { id: 'i1', label: 'Đăng ký thiết bị mới', enabled: false },
          { id: 'i2', label: 'Cập nhật Firmware từ xa', enabled: false },
          { id: 'i3', label: 'Thiết lập ngưỡng cảnh báo', enabled: false },
          { id: 'i4', label: 'Reset cấu hình mạng', enabled: false },
        ],
      },
    ],
  },

  {
    id: 'medical',
    name: 'Nhân viên Y tế',
    roleCode: 'ROLE_005',
    icon: 'medical_services',
    headerIcon: 'medical_services',
    note: 'Nhóm Y tế quản lý hồ sơ sức khỏe, tiêm chủng và theo dõi sự cố y tế trong trường.',
    lastUpdated: '15/09/2023 16:10 bởi Admin_02',
    modules: [
      {
        id: 'grading',
        title: 'Quản lý điểm số',
        icon: 'grade',
        enabled: false,
        items: [
          { id: 'g1', label: 'Nhập điểm thành phần', enabled: false },
          { id: 'g2', label: 'Chỉnh sửa điểm đã khóa', enabled: false },
          { id: 'g3', label: 'Phê duyệt bảng điểm tổng kết', enabled: false },
          { id: 'g4', label: 'Xuất báo cáo học thuật', enabled: false },
        ],
      },
      {
        id: 'attendance',
        title: 'Điểm danh & Chuyên cần',
        icon: 'fact_check',
        enabled: true,
        items: [
          { id: 'a1', label: 'Xác nhận nghỉ phép lý do sức khỏe', enabled: true },
          { id: 'a2', label: 'Cập nhật hồ sơ bệnh án học sinh', enabled: true },
          { id: 'a3', label: 'Gửi thông báo y tế cho phụ huynh', enabled: true },
          { id: 'a4', label: 'Truy xuất lịch sử quét thẻ', enabled: false },
        ],
      },
      {
        id: 'finance',
        title: 'Báo cáo tài chính & Học phí',
        icon: 'analytics',
        enabled: false,
        items: [
          { id: 'f1', label: 'Xem dòng tiền tổng thể', enabled: false },
          { id: 'f2', label: 'Miễn giảm học phí đặc biệt', enabled: false },
          { id: 'f3', label: 'Đối soát thanh toán ngân hàng', enabled: false },
          { id: 'f4', label: 'Xóa hóa đơn đã phát hành', enabled: false },
        ],
      },
      {
        id: 'iot',
        title: 'Cấu hình thiết bị IoT',
        icon: 'settings_input_component',
        enabled: true,
        items: [
          { id: 'i1', label: 'Quản lý thiết bị đo thân nhiệt', enabled: true },
          { id: 'i2', label: 'Cập nhật Firmware máy quét y tế', enabled: true },
          { id: 'i3', label: 'Thiết lập ngưỡng cảnh báo sốt', enabled: true },
          { id: 'i4', label: 'Reset cấu hình mạng', enabled: false },
        ],
      },
    ],
  },
  {
    id: 'accountant',
    name: 'Kế toán',
    roleCode: 'ROLE_006',
    icon: 'payments',
    headerIcon: 'payments',
    note: 'Nhóm Kế toán có thẩm quyền quản lý toàn bộ nguồn thu học phí và báo cáo tài chính.',
    lastUpdated: '20/09/2023 10:00 bởi Admin_01',
    modules: [
      {
        id: 'grading',
        title: 'Quản lý điểm số',
        icon: 'grade',
        enabled: false,
        items: [
          { id: 'g1', label: 'Nhập điểm thành phần', enabled: false },
          { id: 'g2', label: 'Chỉnh sửa điểm đã khóa', enabled: false },
          { id: 'g3', label: 'Phê duyệt bảng điểm tổng kết', enabled: false },
          { id: 'g4', label: 'Xuất báo cáo học thuật', enabled: false },
        ],
      },
      {
        id: 'attendance',
        title: 'Điểm danh & Chuyên cần',
        icon: 'fact_check',
        enabled: false,
        items: [
          { id: 'a1', label: 'Chốt sổ điểm danh ngày', enabled: false },
          { id: 'a2', label: 'Xác nhận đơn xin nghỉ phép', enabled: false },
          { id: 'a3', label: 'Gửi thông báo vắng mặt tự động', enabled: false },
          { id: 'a4', label: 'Truy xuất lịch sử quét thẻ', enabled: false },
        ],
      },
      {
        id: 'finance',
        title: 'Báo cáo tài chính & Học phí',
        icon: 'analytics',
        enabled: true,
        items: [
          { id: 'f1', label: 'Xem dòng tiền tổng thể', enabled: true },
          { id: 'f2', label: 'Miễn giảm học phí đặc biệt', enabled: true },
          { id: 'f3', label: 'Đối soát thanh toán ngân hàng', enabled: true },
          { id: 'f4', label: 'Xóa hóa đơn đã phát hành', enabled: true },
        ],
      },
      {
        id: 'iot',
        title: 'Cấu hình thiết bị IoT',
        icon: 'settings_input_component',
        enabled: false,
        items: [
          { id: 'i1', label: 'Đăng ký thiết bị mới', enabled: false },
          { id: 'i2', label: 'Cập nhật Firmware từ xa', enabled: false },
          { id: 'i3', label: 'Thiết lập ngưỡng cảnh báo', enabled: false },
          { id: 'i4', label: 'Reset cấu hình mạng', enabled: false },
        ],
      },
    ],
  },
]

export default function SystemPermissionsPage() {
  const [rolesData, setRolesData] = useState<RoleData[]>(INITIAL_ROLES)
  const [activeRoleId, setActiveRoleId] = useState<string>('admin')
  const [searchRole, setSearchRole] = useState('')
  const [changesCount, setChangesCount] = useState(12)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const activeRole = useMemo(
    () => rolesData.find(r => r.id === activeRoleId) || rolesData[0],
    [rolesData, activeRoleId]
  )

  const filteredRoles = useMemo(() => {
    if (!searchRole.trim()) return rolesData
    const q = searchRole.toLowerCase()
    return rolesData.filter(r => r.name.toLowerCase().includes(q) || r.roleCode.toLowerCase().includes(q))
  }, [rolesData, searchRole])

  const toggleModuleMaster = (moduleId: string) => {
    setRolesData(prev =>
      prev.map(role => {
        if (role.id !== activeRoleId) return role
        return {
          ...role,
          modules: role.modules.map(mod => {
            if (mod.id !== moduleId) return mod
            const nextState = !mod.enabled
            return {
              ...mod,
              enabled: nextState,
              items: mod.items.map(item => ({ ...item, enabled: nextState })),
            }
          }),
        }
      })
    )
    setChangesCount(c => c + 1)
  }

  const togglePermissionItem = (moduleId: string, itemId: string) => {
    setRolesData(prev =>
      prev.map(role => {
        if (role.id !== activeRoleId) return role
        return {
          ...role,
          modules: role.modules.map(mod => {
            if (mod.id !== moduleId) return mod
            const updatedItems = mod.items.map(item => (item.id === itemId ? { ...item, enabled: !item.enabled } : item))
            const anyEnabled = updatedItems.some(i => i.enabled)
            return {
              ...mod,
              enabled: anyEnabled,
              items: updatedItems,
            }
          }),
        }
      })
    )
    setChangesCount(c => c + 1)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaveSuccess(true)
      setChangesCount(0)
      setTimeout(() => setSaveSuccess(false), 2500)
    }, 1000)
  }

  const handleCancelChanges = () => {
    setRolesData(INITIAL_ROLES)
    setChangesCount(0)
  }

  return (
    <div className="p-6 md:p-8 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        {/* Breadcrumbs & Title Area */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-gray-500 mb-2 text-xs font-semibold">
            <span>Hệ thống</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#003d64] font-bold">Phân quyền</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Phân quyền hệ thống</h1>
              <p className="text-xs text-gray-500 mt-1">
                Quản lý vai trò người dùng và thiết lập quyền hạn truy cập các module chức năng.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#003d64] hover:bg-gray-50 shadow-sm transition-all">
                <span className="material-symbols-outlined text-[20px] mr-2">history</span>
                Lịch sử thay đổi
              </button>
              <button className="flex items-center px-4 py-2.5 bg-[#003d64] text-white rounded-lg text-xs font-bold shadow-sm hover:bg-[#002d4b] transition-all">
                <span className="material-symbols-outlined text-[20px] mr-2">add</span>
                Thêm vai trò
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Role List Sidebar */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                  <input
                    type="text"
                    value={searchRole}
                    onChange={e => setSearchRole(e.target.value)}
                    placeholder="Lọc nhóm vai trò..."
                    className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#003d64]"
                  />
                </div>
              </div>
              <nav className="divide-y divide-gray-50">
                {filteredRoles.map((r: RoleData) => {
                  const isActive = r.id === activeRoleId
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveRoleId(r.id)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-all border-l-4 ${isActive
                        ? 'bg-[#003d64]/5 border-[#003d64] text-[#003d64] font-bold'
                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-[#003d64]' : 'text-gray-500'}`}>
                          {r.icon}
                        </span>
                        <span className="text-xs font-semibold">{r.name}</span>
                      </div>
                      <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#003d64]' : 'text-gray-400'}`}>
                        chevron_right
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Note Box */}
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-1.5 text-[#003d64]">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Ghi chú</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {activeRole.note}
              </p>
            </div>
          </div>

          {/* Permission Details Canvas */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Active Role Card Header */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#003d64]/10 rounded-full flex items-center justify-center text-[#003d64]">
                  <span className="material-symbols-outlined text-[24px]">{activeRole.headerIcon}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900">{activeRole.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Đang hoạt động
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ID: {activeRole.roleCode} • Cập nhật lần cuối: {activeRole.lastUpdated}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button title="Chỉnh sửa vai trò" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button title="Sao chép cấu hình" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">content_copy</span>
                </button>
                <button title="Xóa vai trò" className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>

            {/* Permission Grid: 4 Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRole.modules.map((mod: ModulePermission) => (
                <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#003d64]">
                        {mod.icon}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{mod.title}</span>
                    </div>
                    {/* Master Switch */}
                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input
                        type="checkbox"
                        checked={mod.enabled}
                        onChange={() => toggleModuleMaster(mod.id)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003d64]"></div>
                    </label>
                  </div>
                  <div className="p-5 space-y-4">
                    {mod.items.map((item: PermissionItem) => (
                      <div key={item.id} className={`flex items-center justify-between transition-opacity ${item.enabled ? 'opacity-100' : 'opacity-50'}`}>
                        <span className="text-xs text-gray-800 font-medium">{item.label}</span>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => togglePermissionItem(mod.id, item.id)}
                          className="accent-[#003d64] w-4 h-4 rounded cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="material-symbols-outlined text-[18px] text-[#003d64]">auto_awesome</span>
                <span className="text-xs italic">Đã có {changesCount} thay đổi chưa được lưu</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleCancelChanges}
                  className="px-8 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  Hủy thay đổi
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-10 py-2.5 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 ${saveSuccess
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-[#003d64] hover:bg-[#002d4b]'
                    }`}
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      Đang lưu...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Đã cập nhật
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Lưu cấu hình phân quyền
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div className="mt-12 mb-6 text-center">
          <p className="text-gray-400 text-[11px] font-medium tracking-wider uppercase">
            © 2024 CMC University Smart School Management System. Bảo mật cấp độ doanh nghiệp.
          </p>
        </div>
      </div>
    </div>
  )
}
