'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { getStudentYearResult, confirmYearResult, finalizeYearResult } from '@/lib/api'

const PROMO_LABELS: Record<string, string> = {
  PROMOTED: 'Được lên lớp',
  RETAKE_REQUIRED: 'Đánh giá lại',
  SUMMER_REMEDIAL_REQUIRED: 'Rèn hè',
  NOT_PROMOTED: 'Ở lại lớp',
  PENDING_REVIEW: 'Chờ xét duyệt',
}

const FINAL_OPTIONS = [
  { value: 'PROMOTED', label: 'Được lên lớp' },
  { value: 'RETAKE_REQUIRED', label: 'Đánh giá lại' },
  { value: 'SUMMER_REMEDIAL_REQUIRED', label: 'Rèn hè' },
  { value: 'NOT_PROMOTED', label: 'Ở lại lớp' },
]

export default function YearResultDetailPage() {
  const params = useParams()
  const search = useSearchParams()
  const router = useRouter()
  const studentId = Number(params.studentId)
  const yearId = Number(search.get('yearId'))
  const classId = search.get('classId')

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [finalResult, setFinalResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    if (!studentId || !yearId) return
    getStudentYearResult(studentId, yearId)
      .then((r) => {
        if (r.success) {
          setResult(r.data)
          setFinalResult(r.data.final_result || '')
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [studentId, yearId])

  // Quay lại danh sách, giữ lớp đang xét để trang danh sách tự chọn và tải lại.
  const goBack = () => {
    if (classId) {
      router.push(`/year-result?classId=${classId}${yearId ? `&yearId=${yearId}` : ''}`)
    } else {
      router.push('/year-result')
    }
  }

  const handleConfirm = async () => {
    if (!result || !finalResult) return
    setBusy(true)
    try {
      const r = await confirmYearResult(result.result_id, finalResult)
      if (r.success) {
        setResult(r.data)
        setNotify({ type: 'success', message: 'Đã xác nhận kết quả cuối' })
      } else {
        setNotify({ type: 'error', message: r.error || 'Lỗi xác nhận' })
      }
    } finally {
      setBusy(false)
    }
  }

  const handleFinalize = async () => {
    if (!result || result.finalized) return
    setBusy(true)
    try {
      const r = await finalizeYearResult(result.result_id)
      if (r.success) {
        setResult(r.data)
        setNotify({ type: 'success', message: 'Đã khóa kết quả' })
      } else {
        setNotify({ type: 'error', message: r.error || 'Lỗi khóa kết quả' })
      }
    } finally {
      setBusy(false)
    }
  }

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-xs font-semibold text-gray-900">{children}</span>
    </div>
  )

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Đang tải...</div>
  }

  if (!result) {
    return (
      <div className="p-8">
        <p className="text-sm text-gray-500">Không tìm thấy kết quả.</p>
        <button onClick={goBack} className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-sm">Quay lại</button>
      </div>
    )
  }

  const promoLabel = PROMO_LABELS[result.promotion_status] || result.promotion_status

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {notify && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold text-white"
          style={{ background: notify.type === 'success' ? '#059669' : '#dc2626' }}
        >
          {notify.message}
          <button onClick={() => setNotify(null)} className="ml-2 font-bold">✕</button>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Kết quả cuối năm</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Chi tiết xét duyệt của học sinh</p>
        </div>
        <button onClick={goBack} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">Quay lại</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Học tập & Điểm danh</h2>
          <Row label="Học lực">{result.academic_result}</Row>
          <Row label="Số môn ĐTB ≥ 9.0">{result.subjects_ge_9}</Row>
          <Row label="Số buổi đi học">{result.present_sessions}</Row>
          <Row label="Vắng có phép">{result.absent_excused_sessions}</Row>
          <Row label="Vắng không phép">{result.absent_unexcused_sessions}</Row>
          <Row label="Đi trễ">{result.late_sessions}</Row>
          <Row label="Tổng vắng">{result.total_absence_sessions} buổi</Row>
          <Row label="Cảnh báo điểm danh">
            <span className={result.attendance_warning === 'EXCEEDED' ? 'text-red-600' : result.attendance_warning === 'AT_LIMIT' ? 'text-orange-600' : 'text-gray-900'}>
              {result.attendance_warning}
            </span>
          </Row>
        </div>

        {/* Decision */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-gray-900 mb-2">Danh hiệu & Lên lớp</h2>
          <Row label="Danh hiệu">{result.award}</Row>
          <Row label="Đề xuất hệ thống">{promoLabel}</Row>
          <Row label="Kết quả cuối">{result.final_result ? PROMO_LABELS[result.final_result] || result.final_result : 'Chưa xác nhận'}</Row>
          <Row label="Trạng thái">{result.finalized ? 'Đã khóa' : 'Chưa khóa'}</Row>
          {result.reviewed_at && (
            <Row label="Ngày xác nhận">{new Date(result.reviewed_at).toLocaleString('vi-VN')}</Row>
          )}
          {result.finalized_at && (
            <Row label="Ngày khóa">{new Date(result.finalized_at).toLocaleString('vi-VN')}</Row>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-3">Xác nhận kết quả cuối (GVCN / Hiệu trưởng)</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {FINAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFinalResult(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${finalResult === opt.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={busy || !finalResult}
            className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            Xác nhận kết quả
          </button>
          <button
            onClick={handleFinalize}
            disabled={busy || !result.final_result}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Khóa kết quả
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-3">Cần xác nhận kết quả cuối trước khi khóa.</p>
      </div>
    </div>
  )
}
