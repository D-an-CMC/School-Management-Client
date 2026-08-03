'use client'

import { useEffect, useState, useCallback } from 'react'
import { getSecurityLogs, getSecurityLogStats } from '@/lib/api'

interface SecurityLog {
  log_id: number
  user_id?: number | null
  user_email: string
  user_name: string
  role_name: string
  action: string
  status: string
  ip_address: string
  user_agent?: string
  details?: string
  created_at: string
}

interface LogStats {
  successCount: number
  failureCount: number
  warningCount: number
  successRate: string
  todayCount: number
  hourlyLogins: number[]
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSecurityLogs({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        page,
        limit: 15,
      })
      if (res && res.data) {
        setLogs(res.data)
        setTotalCount(res.total || res.data.length)
        setTotalPages(Math.ceil((res.total || res.data.length) / 15) || 1)
      }
    } catch (err) {
      console.error('Failed to load security logs:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, actionFilter, roleFilter, page])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getSecurityLogStats()
      if (data) setStats(data)
    } catch (err) {
      console.error('Failed to load security log stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr)
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return isoStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Thành công':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 inline-flex">
            <span>✓</span> Thành công
          </span>
        )
      case 'Thất bại':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1 inline-flex">
            <span>✗</span> Thất bại
          </span>
        )
      case 'Cảnh báo':
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 inline-flex">
            <span>⚠️</span> Cảnh báo
          </span>
        )
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50/50">
      {/* Header Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-4 md:p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-xl font-bold">
            🛡️
          </div>
          <div>
            <h1 className="font-bold text-base md:text-xl text-white">Nhật ký Bảo mật & Giám sát Truy cập</h1>
            <p className="text-xs md:text-sm text-emerald-100 mt-0.5">
              Ghi nhận tất cả lịch sử Đăng nhập, Đăng xuất và Thao tác hệ thống theo thời gian thực (Dành cho Admin).
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchLogs()
            fetchStats()
          }}
          className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span>🔄</span> Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {statsLoading ? '...' : (stats?.successCount || 0).toLocaleString()}
          </div>
          <div className="text-xs font-medium text-gray-900 mt-1">Truy cập thành công</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Đăng nhập hợp lệ</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-1">⚠️</div>
          <div className="text-xl md:text-2xl font-bold text-red-600">
            {statsLoading ? '...' : (stats?.failureCount || 0).toLocaleString()}
          </div>
          <div className="text-xs font-medium text-gray-900 mt-1">Đăng nhập thất bại</div>
          <div className="text-[11px] text-red-500 mt-0.5">Sai mật khẩu / Khóa</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-1">🔐</div>
          <div className="text-xl md:text-2xl font-bold text-emerald-600">
            {statsLoading ? '...' : (stats?.successRate || '100%')}
          </div>
          <div className="text-xs font-medium text-gray-900 mt-1">Tỷ lệ An toàn</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Hệ thống bảo vệ</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="text-2xl mb-1">🔒</div>
          <div className="text-xl md:text-2xl font-bold text-amber-600">
            {statsLoading ? '...' : (stats?.todayCount || 0)}
          </div>
          <div className="text-xs font-medium text-gray-900 mt-1">Sự kiện Hôm nay</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Ghi nhận trong phiên</div>
        </div>
      </div>

      {/* Hourly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>📈 Tần suất Đăng nhập theo giờ</span>
            <span className="text-[10px] text-gray-400 font-normal">12 Giờ gần nhất</span>
          </h3>
          <div className="flex items-end gap-2 h-36 pt-2 border-b border-gray-100">
            {(stats?.hourlyLogins || [65, 45, 80, 55, 90, 70, 85, 60, 75, 40, 88, 95]).map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {val} lượt
                </div>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t transition-all group-hover:from-blue-500 group-hover:to-indigo-400"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[9px] text-gray-400 font-medium">{i * 2}h</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 shadow-sm">
          <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span>🔑 Phiên làm việc & Token JWT</span>
            <span className="text-[10px] text-gray-400 font-normal">Xác thực tự động</span>
          </h3>
          <div className="flex items-end gap-2 h-36 pt-2 border-b border-gray-100">
            {[30, 50, 25, 60, 35, 70, 45, 80, 55, 40, 65, 50].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {val * 3} token
                </div>
                <div
                  className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all group-hover:from-emerald-500 group-hover:to-teal-300"
                  style={{ height: `${val}%` }}
                ></div>
                <span className="text-[9px] text-gray-400 font-medium">{i * 2}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm theo email, tên, IP, chi tiết..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="Thành công">Thành công</option>
            <option value="Thất bại">Thất bại</option>
            <option value="Cảnh báo">Cảnh báo</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả Hành động</option>
            <option value="Đăng nhập">Đăng nhập</option>
            <option value="Đăng xuất">Đăng xuất</option>
            <option value="Cập nhật">Cập nhật hệ thống</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Hiển thị <span className="font-semibold text-gray-900">{logs.length}</span> / {totalCount} bản ghi
        </div>
      </div>

      {/* Security Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[800px]">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">THỜI GIAN</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">TÀI KHOẢN / TÊN</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs hidden md:table-cell">VAI TRÒ</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">HÀNH ĐỘNG</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">TRẠNG THÁI</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs hidden lg:table-cell">IP ADDRESS</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs hidden sm:table-cell">CHI TIẾT</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="inline-block animate-spin mr-2">⏳</div> Đang tải nhật ký bảo mật...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy nhật ký bảo mật nào phù hợp.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs font-mono whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{log.user_name || log.user_email}</div>
                      <div className="text-[11px] text-gray-500">{log.user_email}</div>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                        {log.role_name}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {log.action}
                    </td>

                    <td className="px-4 py-3">
                      {getStatusBadge(log.status)}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-gray-600">
                      {log.ip_address}
                    </td>

                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 text-xs max-w-xs truncate">
                      {log.details || log.user_agent || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              ← Trang trước
            </button>

            <span className="text-xs text-gray-600 font-medium">
              Trang {page} / {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Trang sau →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
