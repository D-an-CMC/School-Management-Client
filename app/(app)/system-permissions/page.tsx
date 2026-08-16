'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { getRoles, updateRolePermissions } from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionItem {
  id: string
  label: string
  permissionId: number
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
  role_id: number
  role_name: string
  description: string
  note: string
  lastUpdated: string
  modules: ModulePermission[]
}

// Icon map per role name
function roleIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('admin')) return 'admin_panel_settings'
  if (n.includes('giảng') || n.includes('teacher') || n.includes('giáo')) return 'school'
  if (n.includes('học sinh') || n.includes('student')) return 'person'
  if (n.includes('y tế') || n.includes('medical')) return 'medical_services'
  if (n.includes('kế toán') || n.includes('accountant')) return 'payments'
  if (n.includes('bảo vệ') || n.includes('security')) return 'security'
  return 'manage_accounts'
}

// Derive active permission IDs from current role module state
function getActivePermissionIds(modules: ModulePermission[]): number[] {
  const ids: number[] = []
  for (const mod of modules) {
    for (const item of mod.items) {
      if (item.enabled) ids.push(item.permissionId)
    }
  }
  return ids
}

// Count changed permission items vs original snapshot
function countChanges(current: RoleData[], original: RoleData[]): number {
  let count = 0
  for (const cur of current) {
    const orig = original.find(r => r.role_id === cur.role_id)
    if (!orig) continue
    for (const mod of cur.modules) {
      const origMod = orig.modules.find(m => m.id === mod.id)
      if (!origMod) continue
      for (const item of mod.items) {
        const origItem = origMod.items.find(i => i.id === item.id)
        if (origItem && origItem.enabled !== item.enabled) count++
      }
    }
  }
  return count
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemPermissionsPage() {
  const [rolesData, setRolesData] = useState<RoleData[]>([])
  const [originalData, setOriginalData] = useState<RoleData[]>([])
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null)
  const [searchRole, setSearchRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Load roles from API ──────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getRoles()
      if (!data || !Array.isArray(data)) {
        setError('Không thể tải dữ liệu phân quyền. Vui lòng thử lại.')
        return
      }
      // Map API response to RoleData shape
      const roles: RoleData[] = data.map((r: any) => ({
        role_id: r.role_id,
        role_name: r.role_name,
        description: r.description ?? '',
        note: r.note ?? r.description ?? '',
        lastUpdated: r.lastUpdated ?? '',
        modules: (r.modules ?? []) as ModulePermission[],
      }))
      setRolesData(roles)
      // Deep clone for original snapshot
      setOriginalData(JSON.parse(JSON.stringify(roles)))
      if (roles.length > 0) setActiveRoleId(roles[0].role_id)
    } catch (err: any) {
      setError(err?.message ?? 'Lỗi kết nối server. Vui lòng kiểm tra server đang chạy.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ── Derived state ────────────────────────────────────────────────────────
  const activeRole = useMemo(
    () => rolesData.find(r => r.role_id === activeRoleId) ?? rolesData[0] ?? null,
    [rolesData, activeRoleId]
  )

  const filteredRoles = useMemo(() => {
    if (!searchRole.trim()) return rolesData
    const q = searchRole.toLowerCase()
    return rolesData.filter(r => r.role_name.toLowerCase().includes(q))
  }, [rolesData, searchRole])

  const changesCount = useMemo(() => countChanges(rolesData, originalData), [rolesData, originalData])

  // ── Toggle helpers ───────────────────────────────────────────────────────
  const toggleModuleMaster = (moduleId: string) => {
    setRolesData(prev =>
      prev.map(role => {
        if (role.role_id !== activeRoleId) return role
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
  }

  const togglePermissionItem = (moduleId: string, itemId: string) => {
    setRolesData(prev =>
      prev.map(role => {
        if (role.role_id !== activeRoleId) return role
        return {
          ...role,
          modules: role.modules.map(mod => {
            if (mod.id !== moduleId) return mod
            const updatedItems = mod.items.map(item =>
              item.id === itemId ? { ...item, enabled: !item.enabled } : item
            )
            const anyEnabled = updatedItems.some(i => i.enabled)
            return { ...mod, enabled: anyEnabled, items: updatedItems }
          }),
        }
      })
    )
  }

  // ── Save – only saves roles that actually changed ────────────────────────
  const handleSave = async () => {
    if (!activeRole) return
    setSaving(true)
    try {
      // Find all roles with changes and save them all
      const changedRoles = rolesData.filter(cur => {
        const orig = originalData.find(o => o.role_id === cur.role_id)
        if (!orig) return false
        const curIds = getActivePermissionIds(cur.modules).sort().join(',')
        const origIds = getActivePermissionIds(orig.modules).sort().join(',')
        return curIds !== origIds
      })

      await Promise.all(
        changedRoles.map(role =>
          updateRolePermissions(role.role_id, getActivePermissionIds(role.modules))
        )
      )

      // Update snapshot so changesCount resets
      setOriginalData(JSON.parse(JSON.stringify(rolesData)))
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: any) {
      setError(err?.message ?? 'Lưu thất bại. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelChanges = () => {
    setRolesData(JSON.parse(JSON.stringify(originalData)))
  }

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[#f8f9fa] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-[48px] text-[#003d64] animate-spin block">sync</span>
          <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu phân quyền...</p>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error && rolesData.length === 0) {
    return (
      <div className="p-6 md:p-8 bg-[#f8f9fa] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center shadow-sm space-y-4">
          <span className="material-symbols-outlined text-[48px] text-red-500 block">error</span>
          <h2 className="text-base font-bold text-gray-900">Không thể tải dữ liệu</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#003d64] text-white rounded-lg text-xs font-bold hover:bg-[#002d4b] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1400px] mx-auto">

        {/* Error banner (non-fatal) */}
        {error && (
          <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <span className="material-symbols-outlined text-red-500 text-[18px]">warning</span>
            <p className="text-xs text-red-700 font-medium flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

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
                    className="w-full bg-gray-50 border-none rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#003d64]"
                  />
                </div>
              </div>
              <nav className="divide-y divide-gray-50">
                {filteredRoles.map((r: RoleData) => {
                  const isActive = r.role_id === activeRoleId
                  const icon = roleIcon(r.role_name)
                  // Check if this role has unsaved changes
                  const orig = originalData.find(o => o.role_id === r.role_id)
                  const hasChanges = orig
                    ? getActivePermissionIds(r.modules).sort().join(',') !==
                      getActivePermissionIds(orig.modules).sort().join(',')
                    : false

                  return (
                    <button
                      key={r.role_id}
                      onClick={() => setActiveRoleId(r.role_id)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-all border-l-4 ${
                        isActive
                          ? 'bg-[#003d64]/5 border-[#003d64] text-[#003d64] font-bold'
                          : 'border-transparent text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`material-symbols-outlined text-[20px] shrink-0 ${isActive ? 'text-[#003d64]' : 'text-gray-500'}`}>
                          {icon}
                        </span>
                        <span className="text-xs font-semibold truncate">{r.role_name}</span>
                        {hasChanges && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400" title="Có thay đổi chưa lưu" />
                        )}
                      </div>
                      <span className={`material-symbols-outlined text-[18px] shrink-0 ${isActive ? 'text-[#003d64]' : 'text-gray-400'}`}>
                        chevron_right
                      </span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Note Box */}
            {activeRole && (
              <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-1.5 text-[#003d64]">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Ghi chú</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {activeRole.note || 'Chưa có mô tả cho vai trò này.'}
                </p>
                {activeRole.lastUpdated && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    Cập nhật: {activeRole.lastUpdated}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Permission Details Canvas */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {activeRole ? (
              <>
                {/* Active Role Card Header */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#003d64]/10 rounded-full flex items-center justify-center text-[#003d64]">
                      <span className="material-symbols-outlined text-[24px]">{roleIcon(activeRole.role_name)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-base font-bold text-gray-900">{activeRole.role_name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                          Đang hoạt động
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: ROLE_{String(activeRole.role_id).padStart(3, '0')}
                        {activeRole.lastUpdated && ` • Cập nhật: ${activeRole.lastUpdated}`}
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

                {/* Permission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRole.modules.map((mod: ModulePermission) => (
                    <div key={mod.id} className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#003d64]">{mod.icon}</span>
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
                          <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#003d64]" />
                        </label>
                      </div>
                      <div className="p-5 space-y-4">
                        {mod.items.map((item: PermissionItem) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between transition-opacity ${item.enabled ? 'opacity-100' : 'opacity-50'}`}
                          >
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
                    {changesCount > 0 ? (
                      <span className="text-xs italic">
                        Có <strong>{changesCount}</strong> thay đổi chưa được lưu
                      </span>
                    ) : (
                      <span className="text-xs italic text-gray-400">Không có thay đổi</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleCancelChanges}
                      disabled={changesCount === 0}
                      className="px-8 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-colors"
                    >
                      Hủy thay đổi
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || changesCount === 0}
                      className={`px-10 py-2.5 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                        saveSuccess
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
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Chưa có vai trò nào. Hãy tạo vai trò đầu tiên.
              </div>
            )}
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
