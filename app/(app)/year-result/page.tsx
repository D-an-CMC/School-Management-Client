'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { getClasses, getClassYearResults, evaluateClassYearResults, getYearResultsOverview } from '@/lib/api'

const PROMO_LABELS: Record<string, { label: string; color: string }> = {
  PROMOTED: { label: 'Được lên lớp', color: 'bg-green-100 text-green-700' },
  RETAKE_REQUIRED: { label: 'Đánh giá lại', color: 'bg-orange-100 text-orange-700' },
  SUMMER_REMEDIAL_REQUIRED: { label: 'Rèn hè', color: 'bg-amber-100 text-amber-700' },
  NOT_PROMOTED: { label: 'Ở lại lớp', color: 'bg-red-100 text-red-700' },
  PENDING_REVIEW: { label: 'Chờ xét duyệt', color: 'bg-purple-100 text-purple-700' },
}

const AWARD_COLORS: Record<string, string> = {
  'HỌC SINH XUẤT SẮC': 'bg-yellow-100 text-yellow-700',
  'HỌC SINH GIỎI': 'bg-blue-100 text-blue-700',
  'KHÔNG CÓ DANH HIỆU': 'bg-gray-100 text-gray-600',
}

export default function YearResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const classParam = searchParams.get('classId')
  const { user } = useAuth()
  const { selectedSchoolYearId, currentSchoolYear } = useAcademic()
  const yearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? null

  const isTeacher = user?.role === 'teacher'
  const teacherId = (user as any)?.teacherId

  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<any>(null)
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!yearId) return
    getYearResultsOverview(yearId, isTeacher ? teacherId : undefined).then((r) => {
      if (r.success) setOverview(r.data)
    }).catch(() => {})
  }, [yearId, isTeacher, teacherId])

  useEffect(() => {
    if (!yearId) return
    getClasses({ teacherId: isTeacher ? teacherId : undefined, limit: 100, schoolYearId: yearId })
      .then((res) => setClasses(res?.data ?? []))
      .catch(() => {})
  }, [isTeacher, teacherId, yearId])

  const loadResults = useCallback(async (classId: number, recompute = false) => {
    if (!yearId) return
    setLoading(true)
    try {
      const r = await getClassYearResults(classId, yearId, recompute)
      if (r.success) setRows(r.data ?? [])
      else setNotify({ type: 'error', message: r.error || 'Lỗi tải kết quả' })
    } finally {
      setLoading(false)
    }
  }, [yearId])

  const handleSelectClass = useCallback((classId: number) => {
    setSelectedClassId(classId)
    setRows([])
    loadResults(classId)
  }, [loadResults])

  // Tự chọn và tải lớp khi quay lại từ trang chi tiết (classId trong URL).
  useEffect(() => {
    if (!classParam || !yearId) return
    const cid = Number(classParam)
    setSelectedClassId(cid)
    setRows([])
    loadResults(cid)
    // Xóa classId khỏi URL để lần back sau không lặp lại.
    router.replace(`/year-result?yearId=${yearId}`)
  }, [classParam, yearId, loadResults, router])

  const handleEvaluate = async () => {
    if (!selectedClassId || !yearId) return
    setLoading(true)
    try {
      const r = await evaluateClassYearResults(selectedClassId, yearId)
      if (r.success) {
        setNotify({ type: 'success', message: `Đã tính và lưu kết quả cho ${r.data?.evaluated ?? 0} học sinh` })
        loadResults(selectedClassId)
        getYearResultsOverview(yearId, isTeacher ? teacherId : undefined).then((o) => o.success && setOverview(o.data)).catch(() => {})
      } else {
        setNotify({ type: 'error', message: r.error || 'Lỗi tính kết quả' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {notify && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold"
          style={{ background: notify.type === 'success' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff' }}
        >
          <span>{notify.message}</span>
          <button onClick={() => setNotify(null)} className="ml-2 text-white/70 font-bold">✕</button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Xét kết quả cuối năm</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Đánh giá học lực, danh hiệu và kết quả lên lớp - năm học {currentSchoolYear?.year_name ?? ''}
        </p>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-[10px] font-bold uppercase text-blue-700">Đã xét</p>
              {isTeacher ? (
                <>
                  <p className="text-2xl font-bold text-blue-900">
                    {overview.teacher?.evaluatedStudents ?? 0}<span className="text-sm font-semibold text-blue-700">/{overview.teacher?.totalStudents ?? 0} HS</span>
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Đã duyệt • {overview.teacher?.computedStudents ?? 0} HS đã tính</p>
                </>
              ) : (
                <p className="text-2xl font-bold text-blue-900">
                  {overview.doneClasses ?? 0}<span className="text-sm font-semibold text-blue-700">/{overview.totalClasses ?? 0} lớp</span>
                </p>
              )}
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-[10px] font-bold uppercase text-yellow-700">Xuất sắc</p>
              <p className="text-2xl font-bold text-yellow-900">{overview.awards?.['HỌC SINH XUẤT SẮC'] ?? 0}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-[10px] font-bold uppercase text-green-700">Giỏi</p>
              <p className="text-2xl font-bold text-green-900">{overview.awards?.['HỌC SINH GIỎI'] ?? 0}</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <p className="text-[10px] font-bold uppercase text-purple-700">Chờ duyệt</p>
              <p className="text-2xl font-bold text-purple-900">{overview.promotions?.PENDING_REVIEW ?? 0}</p>
            </div>
          </div>

          {/* Admin: danh sách lớp chưa xét */}
          {!isTeacher && (
            <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-6">
              <h2 className="text-xs md:text-sm font-bold text-gray-900 mb-2">
                Tiến độ xét theo lớp
              </h2>
              {overview.pendingClasses?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {overview.pendingClasses.map((name: string) => (
                    <span key={name} className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-semibold">
                      ⏳ {name} - chưa xét đủ
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-green-700 font-semibold">✓ Tất cả các lớp đã được xét.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Class selector + evaluate */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">LỚP</label>
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => handleSelectClass(Number(e.target.value))}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm text-gray-900"
            >
              <option value="">Chọn lớp để xét</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleEvaluate}
            disabled={!selectedClassId || loading}
            className="px-4 md:px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs md:text-sm"
          >
            {loading ? 'Đang tính...' : '⚡ Tính & cập nhật kết quả lớp'}
          </button>
        </div>
      </div>

      {/* Results table */}
      {selectedClassId && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-[10px]">HỌC SINH</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">HỌC LỰC</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">MÔN ≥9.0</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">VẮNG</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">DANH HIỆU</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">ĐỀ XUẤT</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">KẾT QUẢ</th>
                <th className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-[10px]">TT</th>
                <th className="text-right py-3 px-4 font-bold text-gray-700 uppercase text-[10px]">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const res = r.result
                const promo = PROMO_LABELS[res?.promotion_status ?? ''] || PROMO_LABELS.PENDING_REVIEW
                const finalPromo = res?.final_result ? PROMO_LABELS[res.final_result] : null
                const award = res?.award
                return (
                  <tr key={r.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <p className="font-medium text-gray-900">{r.full_name}</p>
                      <p className="text-[10px] text-gray-500">{r.student_code}</p>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${res?.academic_result === 'Tốt' ? 'bg-green-100 text-green-700' : res?.academic_result === 'Khá' ? 'bg-blue-100 text-blue-700' : res?.academic_result === 'Đạt' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {res?.academic_result ?? '-'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center text-gray-700">{res?.subjects_ge_9 ?? 0}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[10px] font-semibold ${res?.attendance_warning === 'EXCEEDED' ? 'text-red-600' : res?.attendance_warning === 'AT_LIMIT' ? 'text-orange-600' : 'text-gray-600'}`}>
                        {res?.total_absence_sessions ?? 0} buổi
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {award ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${AWARD_COLORS[award] || 'bg-gray-100'}`}>{award}</span>
                      ) : '-'}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${promo.color}`}>{promo.label}</span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {finalPromo ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${finalPromo.color}`}>{finalPromo.label}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Chưa duyệt</span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {res?.finalized ? (
                        <span className="text-[10px] text-green-600 font-semibold">Đã khóa</span>
                      ) : (
                        <span className="text-[10px] text-gray-500">{res ? 'Chưa khóa' : 'Chưa tính'}</span>
                      )}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        onClick={() => router.push(`/year-result/${r.student_id}?yearId=${yearId}&classId=${selectedClassId}`)}
                        className="px-3 py-1 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Chi tiết / Duyệt
                      </button>
                    </td>
                  </tr>
                )
              })}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-gray-500">
                    Chưa có dữ liệu kết quả. Bấm "Tính & cập nhật kết quả lớp" để tính.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-gray-500">Đang tải...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
