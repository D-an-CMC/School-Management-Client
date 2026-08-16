'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  getSchoolYears,
  createSchoolYear,
  deleteSchoolYear,
  getYearTransitionOverview,
  getYearTransitionPreview,
  getYearTransitionClasses,
  applyYearTransition,
  activateSchoolYear,
} from '@/lib/api'
import { useAcademic } from '@/lib/academic-context'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'

const STATUS_LABEL: Record<string, string> = {
  PROMOTED: 'Lên lớp',
  RETAINED: 'Lưu ban',
  GRADUATED: 'Tốt nghiệp',
  TRANSFERRED: 'Chuyển trường',
}

const STATUS_COLOR: Record<string, string> = {
  PROMOTED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  RETAINED: 'bg-amber-100 text-amber-700 border-amber-300',
  GRADUATED: 'bg-blue-100 text-blue-700 border-blue-300',
  TRANSFERRED: 'bg-rose-100 text-rose-700 border-rose-300',
}

interface StudentRow {
  student_id: number
  student_code: string
  full_name: string
  current_class_id: number | null
  current_class_name: string | null
  current_grade_level: number | null
  student_status: string
  year_status: string
  avg_score: number | null
  needs_decision: boolean
  suggested_status: string
  suggested_grade_level: number | null
  suggested_class_id: number | null
}

const YEAR_STATUS_LABEL: Record<string, string> = {
  PROMOTED: 'Lên lớp',
  NOT_PROMOTED: 'Ở lại',
  RETAKE_REQUIRED: 'Đánh giá lại',
  SUMMER_REMEDIAL_REQUIRED: 'Rèn hè',
  PENDING_REVIEW: 'Chờ duyệt',
}

const YEAR_STATUS_COLOR: Record<string, string> = {
  PROMOTED: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  NOT_PROMOTED: 'bg-rose-100 text-rose-700 border-rose-300',
  RETAKE_REQUIRED: 'bg-amber-100 text-amber-700 border-amber-300',
  SUMMER_REMEDIAL_REQUIRED: 'bg-orange-100 text-orange-700 border-orange-300',
  PENDING_REVIEW: 'bg-gray-100 text-gray-600 border-gray-300',
}

function autoClassName(s: StudentRow): string {
  const newGrade = s.suggested_grade_level
  if (newGrade == null) return `Khối ${s.current_grade_level ?? '?'}`
  const suffix = (s.current_class_name || '').replace(/\d/g, '')
  return `${newGrade}${suffix}`
}

export default function YearTransitionPage() {
  const { reload } = useAcademic()
  const [years, setYears] = useState<any[]>([])
  const [fromYearId, setFromYearId] = useState<number>('' as any)
  const [toYearId, setToYearId] = useState<number>('' as any)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [confirmActivate, setConfirmActivate] = useState(false)
  const [overview, setOverview] = useState<any>(null)

  // Modal tạo năm học mới
  const [showCreateYear, setShowCreateYear] = useState(false)
  const [newYear, setNewYear] = useState({ year_name: '', start_date: '', end_date: '' })
  const [creatingYear, setCreatingYear] = useState(false)
  const [createYearError, setCreateYearError] = useState('')
  const [deletingYearId, setDeletingYearId] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; name: string } | null>(null)

  // Quyết định: student_id -> { status, class_id, grade_level }
  const [decisions, setDecisions] = useState<Record<number, { status: string; class_id: number | null; grade_level: number | null }>>({})

  useEffect(() => {
    getYearTransitionOverview().then(setOverview).catch(() => {})
    getSchoolYears().then((data) => setYears(Array.isArray(data) ? data : []))
  }, [])

  const handlePreview = async () => {
    setError('')
    setMessage('')
    setDecisions({})
    if (!fromYearId || !toYearId) {
      setError('Vui lòng chọn năm học cũ và năm học mới.')
      return
    }
    setLoadingPreview(true)
    try {
      const res = await getYearTransitionPreview(Number(fromYearId), Number(toYearId))
      if (!res.success) {
        setError(res.error || 'Không tải được dữ liệu')
        setStudents([])
        return
      }
      setStudents(res.data?.students ?? [])

      // Chỉ khởi tạo quyết định cho học sinh cần quyết định (avg < 5, khác khối 9).
      // Còn lại backend tự xử lý (lên lớp / tốt nghiệp).
      const init: Record<number, { status: string; class_id: number | null; grade_level: number | null }> = {}
      for (const s of res.data?.students ?? []) {
        if (!s.needs_decision) continue
        init[s.student_id] = {
          status: s.suggested_status,
          class_id: s.suggested_class_id ?? null,
          grade_level: s.suggested_grade_level,
        }
      }
      setDecisions(init)
      await loadClasses()
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoadingPreview(false)
    }
  }

  const loadClasses = async () => {
    if (!toYearId) return
    try {
      const list = await getYearTransitionClasses(Number(toYearId))
      setClasses(Array.isArray(list) ? list : [])
    } catch {
      // API lỗi — giữ nguyên danh sách hiện tại.
    }
  }

  const handleApply = async () => {
    setError('')
    setMessage('')
    const missingClass = Object.entries(decisions).some(
      ([sid, d]) => (d.status === 'PROMOTED' || d.status === 'RETAINED') && !d.class_id
    )
    if (missingClass) {
      setError('Các học sinh Lên lớp / Lưu ban cần quyết định phải chọn lớp. Vui lòng chọn lớp hoặc bấm "Phân lớp tự động".')
      return
    }
    setApplying(true)
    try {
      const list = Object.entries(decisions).map(([sid, d]) => ({
        student_id: Number(sid),
        status: d.status,
        class_id: d.class_id,
        grade_level: d.grade_level,
      }))
      const res = await applyYearTransition(Number(fromYearId), Number(toYearId), list)
      if (!res.success) {
        setError(res.error || 'Chuyển năm thất bại')
        return
      }
      setMessage(`Đã chuyển ${res.data?.enrolled ?? 0} học sinh sang năm học mới.`)
    } catch (err: any) {
      setError(err.message || 'Lỗi chuyển năm')
    } finally {
      setApplying(false)
    }
  }

  const handleActivate = async () => {
    if (!toYearId) return
    setError('')
    setMessage('')
    setConfirmActivate(true)
  }

  const doActivate = async () => {
    setConfirmActivate(false)
    const res = await activateSchoolYear(Number(toYearId))
    if (res.success) {
      setMessage('Đã kích hoạt năm học mới.')
      reload()
    } else {
      setError(res.error || 'Kích hoạt thất bại')
    }
  }

  const applyAutoYearName = (state: typeof newYear) => {
    if (!state.start_date || !state.end_date) return state
    const s = new Date(state.start_date)
    const e = new Date(state.end_date)
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return state
    const generated = `${s.getFullYear()}-${e.getFullYear()}`
    // Không ghi đè nếu user đã tự nhập (và đang khác năm gen).
    if (state.year_name && state.year_name !== generated) return state
    return { ...state, year_name: generated }
  }

  const createNewYear = async () => {
    setCreateYearError('')
    setMessage('')
    if (!newYear.year_name.trim() || !newYear.start_date || !newYear.end_date) {
      setCreateYearError('Vui lòng nhập tên năm học, ngày bắt đầu và ngày kết thúc.')
      return
    }
    const s = new Date(newYear.start_date)
    const e = new Date(newYear.end_date)
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const startYear = s.getFullYear()
      const endYear = e.getFullYear()
      if (endYear <= startYear) {
        setCreateYearError(`Năm học không hợp lệ: năm kết thúc (${endYear}) phải là năm kế tiếp của năm bắt đầu (${startYear}). Không được trùng năm (${startYear}-${startYear}) hay lùi năm (${endYear}-${startYear}).`)
        return
      }
      if (endYear !== startYear + 1) {
        setCreateYearError(`Năm học không hợp lệ: chỉ được tạo năm kế tiếp (${startYear}-${startYear + 1}), không được cách năm.`)
        return
      }
    }
    const dup = years.find((y) => String(y.year_name) === newYear.year_name.trim())
    if (dup) {
      setCreateYearError(`Năm học "${newYear.year_name.trim()}" đã tồn tại trong hệ thống. Vui lòng chọn ngày khác hoặc xóa bản cũ.`)
      return
    }
    setCreatingYear(true)
    try {
      const res = await createSchoolYear({
        year_name: newYear.year_name.trim(),
        start_date: newYear.start_date,
        end_date: newYear.end_date,
        is_current: false,
      })
      if (!res.success) {
        setCreateYearError(res.error || 'Không tạo được năm học')
        return
      }
      const data = await getSchoolYears()
      setYears(Array.isArray(data) ? data : [])
      if (res.data?.school_year_id) setToYearId(res.data.school_year_id)
      setShowCreateYear(false)
      setNewYear({ year_name: '', start_date: '', end_date: '' })
      setMessage('Đã tạo năm học mới và chọn làm năm học mới.')
    } catch (err: any) {
      setCreateYearError(err.message || 'Lỗi tạo năm học')
    } finally {
      setCreatingYear(false)
    }
  }

  const handleDeleteYear = async (id: number) => {
    setError('')
    setMessage('')
    const target = years.find((y) => Number(y.school_year_id) === Number(id))
    if (target?.is_current) {
      setError(`Không thể xóa năm học "${target.year_name}" vì đây là năm học hiện tại. Hãy chuyển sang năm khác trước khi xóa.`)
      return
    }
    const name = target?.year_name ?? `#${id}`
    setConfirmDelete({ id, name })
  }

  const doDeleteYear = async () => {
    if (!confirmDelete) return
    const { id, name } = confirmDelete
    setConfirmDelete(null)
    setDeletingYearId(id)
    try {
      const res = await deleteSchoolYear(id)
      if (!res.success) {
        setError(`Không thể xóa năm học "${name}". ${res.error || 'Vui lòng thử lại.'}`)
        return
      }
      const data = await getSchoolYears()
      setYears(Array.isArray(data) ? data : [])
      if (Number(toYearId) === Number(id)) setToYearId('' as any)
      setMessage(`Đã xóa năm học "${name}".`)
    } catch (err: any) {
      setError(`Không thể xóa năm học "${name}". Kiểm tra kết nối máy chủ rồi thử lại. (${err?.message || 'lỗi không xác định'})`)
    } finally {
      setDeletingYearId(null)
    }
  }

  const updateDecision = (sid: number, patch: Partial<{ status: string; class_id: number | null; grade_level: number | null }>) => {
    setDecisions((prev) => {
      const cur = prev[sid] || { status: 'PROMOTED', class_id: null, grade_level: null }
      return { ...prev, [sid]: { ...cur, ...patch } }
    })
  }
  const summary = students.reduce((acc, s) => {
    const st = s.needs_decision ? decisions[s.student_id]?.status || 'RETAINED' : s.suggested_status
    acc[st] = (acc[st] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-[#f9f9ff] p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <nav className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Quản trị</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#001d36]">Chuyển năm học</span>
            </nav>
            <h1 className="text-2xl font-bold text-[#111c2d]">Kết thúc năm học &amp; Chuyển năm</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Lên lớp tự động theo khối, lưu ban, tốt nghiệp, chuyển trường. Lịch sử phân lớp được bảo toàn.
            </p>
          </div>
          {overview && (
            <div className="flex gap-3 text-xs font-semibold text-gray-600">
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                <span className="block text-gray-400 font-bold text-[10px] uppercase tracking-wider">Học sinh</span>
                <span className="text-lg text-[#001d36]">{overview.totalStudents ?? 0}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                <span className="block text-gray-400 font-bold text-[10px] uppercase tracking-wider">Enrollments</span>
                <span className="text-lg text-[#001d36]">{overview.totalEnrollments ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold rounded-lg px-4 py-3">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Bước 1: chọn năm */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#111c2d] mb-4">1. Chọn năm học cũ &amp; mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500">Năm học cũ (kết thúc)</label>
              <select
                value={fromYearId}
                onChange={(e) => setFromYearId(e.target.value as any)}
                className="mt-1 w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-[#003366] outline-none shadow-sm"
              >
                <option value="">-- Chọn năm học cũ --</option>
                {years.map((y) => (
                  <option key={y.school_year_id} value={String(y.school_year_id)}>
                    {y.year_name} {y.is_current ? '(hiện tại)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Năm học mới</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={toYearId}
                  onChange={(e) => setToYearId(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-[#003366] outline-none shadow-sm"
                >
                  <option value="">-- Chọn năm học mới --</option>
                  {years.map((y) => (
                    <option key={y.school_year_id} value={String(y.school_year_id)}>
                      {y.year_name} {y.is_current ? '(hiện tại)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => { setCreateYearError(''); setShowCreateYear(true) }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold whitespace-nowrap transition"
                >
                  ＋ Tạo năm học mới
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className="mt-4 px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
          >
            {loadingPreview ? 'Đang tải...' : '2. Đánh giá &amp; đề xuất'}
          </button>
        </div>

        {/* Quản lý năm học */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#111c2d] mb-4">Quản lý năm học</h2>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => (
              <div key={y.school_year_id} className="flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-sm font-semibold text-[#111c2d]">
                  {y.year_name}
                  {y.is_current ? <span className="ml-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">hiện tại</span> : null}
                </span>
                <button
                  onClick={() => handleDeleteYear(Number(y.school_year_id))}
                  disabled={deletingYearId === Number(y.school_year_id)}
                  title={y.is_current ? 'Không thể xóa năm học hiện tại' : 'Xóa năm học'}
                  className={`p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40 ${y.is_current ? 'opacity-30 cursor-not-allowed hover:text-gray-400 hover:bg-transparent' : ''}`}
                >
                  {deletingYearId === Number(y.school_year_id) ? (
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bước 2: danh sách học sinh */}
        {students.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-[#111c2d]">2. Đánh giá học sinh</h2>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {Object.entries(summary).map(([k, v]) => (
                  <span key={k} className={`px-3 py-1 rounded-full border ${STATUS_COLOR[k] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                    {STATUS_LABEL[k] || k}: {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-semibold">{students.length} học sinh</span>
                <span className="px-2 py-1 rounded-full bg-[#003366]/10 text-[#003366] border border-[#003366]/20">
                  {students.filter((s) => s.needs_decision).length} cần quyết định
                </span>
              </div>
              <div className="text-xs text-gray-400">Tự động: học sinh được lên lớp theo kết quả xét cuối năm, khối 9 tốt nghiệp. Chỉ cần quyết định cho học sinh ở lại lớp.</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                    <th className="px-3 py-2">Mã HS</th>
                    <th className="px-3 py-2">Họ tên</th>
                    <th className="px-3 py-2">Lớp cũ</th>
                    <th className="px-3 py-2">Khối</th>
                    <th className="px-3 py-2">Điểm TBCN</th>
                    <th className="px-3 py-2">Kết quả xét</th>
                    <th className="px-3 py-2">Quyết định</th>
                    <th className="px-3 py-2">Lớp mới</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const d = decisions[s.student_id]
                    const isAuto = !s.needs_decision
                    const autoStatus = s.suggested_status
                    const isGraduating = (d?.status || autoStatus) === 'GRADUATED' || (d?.status || autoStatus) === 'TRANSFERRED'
                    const gradePool = classes.filter((c) => c.grade_level === (d?.grade_level ?? s.suggested_grade_level))
                    return (
                      <tr key={s.student_id} className={`border-b border-gray-100 hover:bg-gray-50 ${isAuto ? 'bg-gray-50/50' : ''}`}>
                        <td className="px-3 py-2 text-gray-600">{s.student_code}</td>
                        <td className="px-3 py-2 font-semibold text-[#111c2d]">{s.full_name}</td>
                        <td className="px-3 py-2 text-gray-500">{s.current_class_name ? s.current_class_name : '—'}</td>
                        <td className="px-3 py-2 text-gray-600">Khối {isAuto ? (s.suggested_grade_level ?? s.current_grade_level ?? '?') : (d?.grade_level ?? s.current_grade_level ?? '?')}</td>
                        <td className="px-3 py-2">
                          {s.avg_score != null ? (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${s.avg_score >= 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                              {s.avg_score}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className={`px-3 py-2`}>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${YEAR_STATUS_COLOR[s.year_status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                            {YEAR_STATUS_LABEL[s.year_status] || s.year_status || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {isAuto ? (
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${STATUS_COLOR[autoStatus] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                              {STATUS_LABEL[autoStatus] || autoStatus}
                            </span>
                          ) : (
                            <select
                              value={d?.status ?? 'RETAINED'}
                              onChange={(e) => updateDecision(s.student_id, { status: e.target.value })}
                              className="px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-semibold focus:outline-none"
                            >
                              <option value="PROMOTED">Lên lớp</option>
                              <option value="RETAINED">Lưu ban</option>
                              <option value="TRANSFERRED">Chuyển trường</option>
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {isGraduating ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : isAuto ? (
                            <span className="text-xs font-semibold text-emerald-600">
                              {classes.find((c) => c.class_id === s.suggested_class_id)?.class_name || autoClassName(s)}
                            </span>
                          ) : (
                            <select
                              value={d?.class_id ?? ''}
                              onChange={(e) => updateDecision(s.student_id, { class_id: e.target.value ? Number(e.target.value) : null })}
                              className="px-2 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-medium focus:outline-none"
                            >
                              <option value="">-- Chọn lớp --</option>
                              {gradePool.map((c) => (
                                <option key={c.class_id} value={String(c.class_id)}>
                                  {c.class_name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {applying ? 'Đang xử lý...' : '3. Xác nhận &amp; phân lớp'}
              </button>
              <button
                onClick={handleActivate}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
              >
                4. Kích hoạt năm học mới
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal tạo năm học mới */}
      {showCreateYear && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setShowCreateYear(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#111c2d]">Tạo năm học mới</h3>
              <button onClick={() => setShowCreateYear(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Tên năm học</label>
                <input
                  value={newYear.year_name}
                  onChange={(e) => setNewYear({ ...newYear, year_name: e.target.value })}
                  placeholder="VD: 2027-2028"
                  className="mt-1 w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg font-medium focus:ring-2 focus:ring-[#003366] outline-none placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Ngày bắt đầu</label>
                <CustomDatePicker
                  value={newYear.start_date}
                  onChange={(v) => {
                    const next = { ...newYear, start_date: v }
                    setNewYear(applyAutoYearName(next))
                  }}
                  placeholder="dd/mm/yyyy"
                  minYear={2015}
                  maxYear={2035}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Ngày kết thúc</label>
                <CustomDatePicker
                  value={newYear.end_date}
                  onChange={(v) => {
                    const next = { ...newYear, end_date: v }
                    setNewYear(applyAutoYearName(next))
                  }}
                  placeholder="dd/mm/yyyy"
                  minYear={2015}
                  maxYear={2035}
                  openAbove
                  className="mt-1"
                />
              </div>
              {createYearError && (
                <div className="bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-lg px-4 py-3">
                  {createYearError}
                </div>
              )}
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  onClick={() => setShowCreateYear(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={createNewYear}
                  disabled={creatingYear}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                >
                  {creatingYear ? 'Đang tạo...' : 'Tạo năm học'}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
      {confirmDelete && (
        <div className="fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gradient-to-r from-rose-600 to-rose-500 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Xóa Năm Học</h3>
                <p className="text-xs text-rose-100 mt-0.5">Năm học: {confirmDelete.name}</p>
              </div>
              <button onClick={() => setConfirmDelete(null)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Bạn có chắc muốn xóa năm học <span className="font-bold text-rose-600">"{confirmDelete.name}"</span>?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Toàn bộ dữ liệu liên quan (lớp, học kỳ, điểm, thời khóa biểu, kết quả...) của năm này sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy Bỏ</button>
              <button onClick={doDeleteYear} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition">Xóa Năm Học</button>
            </div>
          </div>
        </div>
      )}
      {confirmActivate && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmActivate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gradient-to-r from-[#003366] to-[#0055a5] text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Kích Hoạt Năm Học Mới</h3>
                <p className="text-xs text-blue-100 mt-0.5">Năm học mới: {years.find(y => Number(y.school_year_id) === Number(toYearId))?.year_name || '—'}</p>
              </div>
              <button onClick={() => setConfirmActivate(false)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Xác nhận <span className="font-bold">kích hoạt năm học mới làm năm hiện tại</span>? Dữ liệu năm cũ sẽ không bị thay đổi.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setConfirmActivate(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy Bỏ</button>
              <button onClick={doActivate} className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition">Xác Nhận Kích Hoạt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
