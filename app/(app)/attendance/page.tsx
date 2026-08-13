'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import {
  getClasses,
  getClassStudents,
  getAttendanceSessions,
  getMyAttendance,
  getAttendanceSession,
  createAttendanceSession,
  saveSessionAttendance,
  getCurrentSemester,
  getCurrentSchoolYear,
} from '@/lib/api'

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Có mặt' },
  { value: 'ABSENT_EXCUSED', label: 'Vắng có phép' },
  { value: 'ABSENT_UNEXCUSED', label: 'Vắng không phép' },
  { value: 'LATE', label: 'Trễ' },
] as const

const STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT_EXCUSED: 'bg-blue-100 text-blue-700',
  ABSENT_UNEXCUSED: 'bg-red-100 text-red-700',
  LATE: 'bg-yellow-100 text-yellow-700',
  'Có mặt': 'bg-green-100 text-green-700',
  'Vắng': 'bg-red-100 text-red-700',
  'Vắng không phép': 'bg-red-100 text-red-700',
  'Vắng có phép': 'bg-blue-100 text-blue-700',
  'Trễ': 'bg-yellow-100 text-yellow-700',
  'Phép': 'bg-blue-100 text-blue-700',
}

function displayStatus(status?: string | null): string {
  switch (status) {
    case 'PRESENT': return 'Có mặt'
    case 'ABSENT_EXCUSED': return 'Vắng có phép'
    case 'ABSENT_UNEXCUSED': return 'Vắng không phép'
    case 'LATE': return 'Trễ'
    case 'Vắng': return 'Vắng không phép'
    case 'Vắng có phép':
    case 'Phép':
    case 'Nghỉ ốm': return 'Vắng có phép'
    default: return 'Có mặt'
  }
}

// Chuyển nhãn (hoặc mã cũ) sang mã chuẩn để lưu.
function toStatusCode(status?: string | null): string {
  switch (status) {
    case 'ABSENT_EXCUSED': return 'ABSENT_EXCUSED'
    case 'ABSENT_UNEXCUSED': return 'ABSENT_UNEXCUSED'
    case 'LATE': return 'LATE'
    case 'Vắng không phép':
    case 'Vắng': return 'ABSENT_UNEXCUSED'
    case 'Vắng có phép':
    case 'Phép':
    case 'Nghỉ ốm': return 'ABSENT_EXCUSED'
    case 'Trễ': return 'LATE'
    default: return 'PRESENT'
  }
}

export default function AttendancePage() {
  const { user } = useAuth()
  const { selectedSchoolYearId } = useAcademic()
  const isTeacher = user?.role === 'teacher'
  const teacherId = (user as any)?.teacherId

  // Teacher state
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [buoi, setBuoi] = useState<'MORNING' | 'AFTERNOON'>('MORNING')
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [session, setSession] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({})
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notify, setNotify] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [currentSemesterId, setCurrentSemesterId] = useState<number | null>(null)
  const [currentYearId, setCurrentYearId] = useState<number | null>(null)

  // Student state
  const [myRecords, setMyRecords] = useState<any[]>([])
  const [studentLoading, setStudentLoading] = useState(true)

  // Auto-dismiss notification sau 3.5s
  useEffect(() => {
    if (!notify) return
    const t = setTimeout(() => setNotify(null), 3500)
    return () => clearTimeout(t)
  }, [notify])

  // Fetch teacher classes
  useEffect(() => {
    if (!isTeacher) return
    getClasses({ teacherId, limit: 50, schoolYearId: selectedSchoolYearId ?? undefined })
      .then((res) => setClasses(res?.data ?? []))
      .catch(() => {})
  }, [isTeacher, teacherId, selectedSchoolYearId])

  // Fetch current semester/year (for creating sessions)
  useEffect(() => {
    if (!isTeacher) return
    getCurrentSemester().then((s) => setCurrentSemesterId(s?.semester_id ?? null)).catch(() => {})
    getCurrentSchoolYear().then((y) => setCurrentYearId(y?.school_year_id ?? null)).catch(() => {})
  }, [isTeacher])

  // Fetch teacher sessions (filtered by selected year)
  useEffect(() => {
    if (!isTeacher) return
    getAttendanceSessions({ teacherId, limit: 50, schoolYearId: selectedSchoolYearId ?? undefined })
      .then((res) => setSessions(res?.data ?? []))
      .catch(() => {})
  }, [isTeacher, teacherId, selectedSchoolYearId])

  // Fetch students when class selected
  useEffect(() => {
    if (!isTeacher || selectedClassId == null) return
    getClassStudents(selectedClassId).then((s) => setStudents(s ?? [])).catch(() => {})
  }, [selectedClassId, isTeacher])

  // Reset map when students/class change
  useEffect(() => {
    setAttendanceMap({})
    setSession(null)
  }, [selectedClassId, buoi, attendanceDate])

  const loadRecordsIntoMap = async (sessionId: number) => {
    const data = await getAttendanceSession(sessionId)
    const map: Record<number, string> = {}
    ;(data?.records || []).forEach((r: any) => {
      map[r.student_id] = toStatusCode(r.status)
    })
    setAttendanceMap(map)
  }

  const openSession = async () => {
    if (!selectedClassId) {
      setNotify({ type: 'error', message: 'Vui lòng chọn lớp học' })
      return
    }
    setCreating(true)
    try {
      // Tìm session trùng (class + date + buổi + year) trước
      const match = sessions.find(
        (s) => s.class_id === selectedClassId && s.attendance_date === attendanceDate && s.session === buoi
      )
      let target = match
      if (!target) {
        const res = await createAttendanceSession({
          teacherId,
          sessionDate: attendanceDate,
          classId: selectedClassId,
          semesterId: currentSemesterId ?? undefined,
          schoolYearId: currentYearId ?? selectedSchoolYearId ?? undefined,
          session: buoi,
          students: students.map((s) => s.student_id),
        })
        if (!res.success) throw new Error(res.error || 'Tạo buổi thất bại')
        target = res.data
      }
      setSession(target)
      await loadRecordsIntoMap(target.session_id)
      // Refresh list
      getAttendanceSessions({ teacherId, limit: 50, schoolYearId: selectedSchoolYearId ?? undefined })
        .then((r) => setSessions(r?.data ?? []))
        .catch(() => {})
      setNotify({ type: 'success', message: match ? 'Đã mở buổi điểm danh' : 'Đã tạo buổi điểm danh mới' })
    } catch (err: any) {
      setNotify({ type: 'error', message: err?.message || 'Lỗi tạo buổi' })
    } finally {
      setCreating(false)
    }
  }

  const setStatus = (studentId: number, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSaveAll = async () => {
    if (!session) return
    setSaving(true)
    try {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status: toStatusCode(status),
      }))
      const res = await saveSessionAttendance(session.session_id, records)
      if (!res.success) throw new Error(res.error || 'Lỗi lưu')
      setNotify({ type: 'success', message: 'Đã lưu điểm danh' })
    } catch (err: any) {
      setNotify({ type: 'error', message: err?.message || 'Lỗi khi lưu điểm danh' })
    } finally {
      setSaving(false)
    }
  }

  // Student: fetch own attendance
  useEffect(() => {
    if (isTeacher) return
    setStudentLoading(true)
    getMyAttendance()
      .then((r) => setMyRecords(r ?? []))
      .catch(() => {})
      .finally(() => setStudentLoading(false))
  }, [isTeacher])

  // Student view
  if (!isTeacher) {
    const counts: Record<string, number> = {}
    const statuses = ['Có mặt', 'Vắng có phép', 'Vắng không phép', 'Trễ']
    statuses.forEach((s) => (counts[s] = 0))
    myRecords.forEach((r: any) => {
      const label = displayStatus(r.status)
      if (counts[label] !== undefined) counts[label]++
    })

    return (
      <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
        <div className="mb-6">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Điểm danh của tôi</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Lịch sử điểm danh cá nhân</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statuses.map((s) => (
            <div key={s} className={`rounded-lg p-3 text-center ${STATUS_COLORS[s] || 'bg-gray-100'}`}>
              <p className="text-xl font-bold">{counts[s]}</p>
              <p className="text-[10px] font-semibold uppercase">{s}</p>
            </div>
          ))}
        </div>

        {studentLoading ? (
          <p className="text-sm text-gray-500">Đang tải...</p>
        ) : myRecords.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có dữ liệu điểm danh</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[400px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 font-bold text-gray-700 uppercase text-[10px]">NGÀY</th>
                  <th className="text-center py-2 md:py-3 px-3 md:px-4 font-bold text-gray-700 uppercase text-[10px]">BUỔI</th>
                  <th className="text-center py-2 md:py-3 px-3 md:px-4 font-bold text-gray-700 uppercase text-[10px]">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.map((r: any, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 md:py-3 px-3 md:px-4 text-gray-900 text-xs md:text-sm">
                      {r.session_date
                        ? new Date(r.session_date).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })
                        : '-'}
                    </td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-center text-gray-600 text-xs md:text-sm">
                      {r.session === 'AFTERNOON' ? 'Chiều' : 'Sáng'}
                    </td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {displayStatus(r.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // Teacher view
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {notify && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold"
          style={{ background: notify.type === 'success' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', borderColor: 'transparent' }}
        >
          <span className="material-symbols-outlined text-[18px]">{notify.type === 'success' ? 'check_circle' : 'error'}</span>
          <span>{notify.message}</span>
          <button onClick={() => setNotify(null)} className="ml-2 text-white/70 hover:text-white font-bold">✕</button>
        </div>
      )}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Điểm danh</h1>
        <p className="text-xs md:text-sm text-gray-600">Sổ đầu bài kỹ thuật số - điểm danh theo buổi</p>
      </div>

      {/* Create / open session */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">LỚP HỌC</label>
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm text-gray-900"
            >
              <option value="">Chọn Lớp Học</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name} ({c.student_count} HS)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">BUỔI</label>
            <select
              value={buoi}
              onChange={(e) => setBuoi(e.target.value as 'MORNING' | 'AFTERNOON')}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm text-gray-900"
            >
              <option value="MORNING">Sáng</option>
              <option value="AFTERNOON">Chiều</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">NGÀY</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm text-gray-900"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={openSession}
              disabled={creating}
              className="w-full px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 text-xs md:text-sm"
            >
              {creating ? 'Đang mở...' : session ? 'Mở lại buổi' : '＋ Tạo buổi điểm danh'}
            </button>
          </div>
        </div>
        {session && (
          <p className="text-xs text-green-700 mt-3">
            Buổi hiện tại: {session.session_date} - {session.session === 'AFTERNOON' ? 'Chiều' : 'Sáng'} • Lớp {session.classes?.class_name ?? ''}
          </p>
        )}
      </div>

      {/* Attendance Table */}
      {selectedClassId && session && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto mb-4 md:mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">MÃ HS</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">HỌC SINH</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => {
                  const currentStatus = attendanceMap[s.student_id] ?? 'PRESENT'
                  return (
                    <tr key={s.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 text-xs md:text-sm">{s.student_code || '-'}</td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-700">
                            {s.full_name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-xs md:text-sm">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="py-2 md:py-3 px-2 md:px-4">
                        <div className="flex flex-wrap gap-1">
                          {STATUS_OPTIONS.map((st) => (
                            <button
                              key={st.value}
                              onClick={() => setStatus(s.student_id, st.value)}
                              className={`px-2 py-0.5 md:py-1 rounded text-[9px] md:text-[10px] font-semibold transition ${currentStatus === st.value
                                ? `${STATUS_COLORS[st.value]} ring-2 ring-blue-400`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 md:p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 text-xs md:text-sm"
            >
              {saving ? 'Đang lưu...' : '💾 Lưu điểm danh'}
            </button>
          </div>
        </div>
      )}

      {selectedClassId && !session && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <p className="text-xs text-gray-500">Bấm "Tạo buổi điểm danh" để mở hoặc tạo buổi cho lớp và ngày đã chọn.</p>
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-gray-900 mb-3">Buổi điểm danh gần đây</h2>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s: any) => (
              <div
                key={s.session_id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSelectedClassId(s.class_id)
                  setBuoi(s.session === 'AFTERNOON' ? 'AFTERNOON' : 'MORNING')
                  setAttendanceDate(s.attendance_date || s.session_date)
                  setSession(s)
                  loadRecordsIntoMap(s.session_id)
                }}
              >
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    {s.attendance_date || s.session_date} - {s.session === 'AFTERNOON' ? 'Chiều' : 'Sáng'} • {s.classes?.class_name ?? 'Chưa rõ lớp'}
                  </p>
                </div>
                <span className="text-[10px] text-gray-500">Bấm để sửa</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
