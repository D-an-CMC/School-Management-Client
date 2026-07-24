'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getClasses, getClassStudents, getAttendanceSessions, getMyAttendance, getAttendanceSession } from '@/lib/api'

type AttendanceStatus = 'Có mặt' | 'Vắng' | 'Trễ' | 'Phép'

const STATUS_COLORS: Record<string, string> = {
  'Có mặt': 'bg-green-100 text-green-700',
  'Vắng': 'bg-red-100 text-red-700',
  'Trễ': 'bg-yellow-100 text-yellow-700',
  'Phép': 'bg-blue-100 text-blue-700',
}

export default function AttendancePage() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'teacher'
  const teacherId = (user as any)?.teacherId

  // Teacher state
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)

  // Student state
  const [myRecords, setMyRecords] = useState<any[]>([])
  const [studentLoading, setStudentLoading] = useState(true)

  // Fetch teacher classes
  useEffect(() => {
    if (!isTeacher) return
    getClasses({ teacherId, limit: 50 })
      .then((res) => setClasses(res?.data ?? []))
      .catch(() => {})
  }, [isTeacher, teacherId])

  // Fetch teacher sessions
  useEffect(() => {
    if (!isTeacher) return
    getAttendanceSessions({ teacherId, limit: 50 })
      .then((res) => setSessions(res?.data ?? []))
      .catch(() => {})
  }, [isTeacher, teacherId])

  // Fetch students when class selected
  useEffect(() => {
    if (!isTeacher || selectedClassId == null) return
    getClassStudents(selectedClassId).then((s) => setStudents(s ?? [])).catch(() => {})
  }, [selectedClassId, isTeacher])

  // Load existing attendance records when session changes
  useEffect(() => {
    if (!isTeacher || selectedSessionId == null) return
    getAttendanceSession(selectedSessionId)
      .then((data) => {
        if (!data) return
        const map: Record<number, string> = {}
        ;(data.records || []).forEach((r: any) => {
          map[r.student_id] = r.status
        })
        setAttendanceMap(map)
      })
      .catch(() => {})
  }, [selectedSessionId, isTeacher])

  // Student: fetch own attendance
  useEffect(() => {
    if (isTeacher) return
    setStudentLoading(true)
    getMyAttendance()
      .then((r) => setMyRecords(r ?? []))
      .catch(() => {})
      .finally(() => setStudentLoading(false))
  }, [isTeacher])

  const setStatus = (studentId: number, status: string) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }))
  }

  const handleSaveAll = async () => {
    if (!selectedSessionId) return
    setSaving(true)
    try {
      // Fetch existing records to get attendanceId per student
      const sessionData = await getAttendanceSession(selectedSessionId)
      const recordsMap = new Map<number, number>()
      ;(sessionData?.records || []).forEach((r: any) => {
        recordsMap.set(r.student_id, r.attendance_id)
      })

      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        attendanceId: recordsMap.get(Number(studentId)) ?? 0,
        status,
      }))

      const res = await fetch('/api/attendance/records/batch', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
      })
      if (!res.ok) throw new Error()
      alert('Đã lưu điểm danh')
      // Reload session to confirm
      getAttendanceSession(selectedSessionId).then((data) => {
        if (!data) return
        const map: Record<number, string> = {}
        ;(data.records || []).forEach((r: any) => { map[r.student_id] = r.status })
        setAttendanceMap(map)
      })
    } catch {
      alert('Lỗi khi lưu điểm danh')
    } finally {
      setSaving(false)
    }
  }

  // Student view
  if (!isTeacher) {
    const counts: Record<string, number> = {}
    const statuses: AttendanceStatus[] = ['Có mặt', 'Vắng', 'Trễ', 'Phép']
    statuses.forEach((s) => (counts[s] = 0))
    myRecords.forEach((r: any) => {
      if (counts[r.status] !== undefined) counts[r.status]++
    })
    const totalDays = myRecords.length

    return (
      <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
        <div className="mb-6">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Điểm danh của tôi</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Lịch sử điểm danh cá nhân</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statuses.map((s) => (
            <div key={s} className={`rounded-lg p-3 text-center ${STATUS_COLORS[s]}`}>
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
                  <th className="text-center py-2 md:py-3 px-3 md:px-4 font-bold text-gray-700 uppercase text-[10px]">TRẠNG THÁI</th>
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 font-bold text-gray-700 uppercase text-[10px] hidden md:table-cell">GHI CHÚ</th>
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
                    <td className="py-2 md:py-3 px-3 md:px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 md:py-3 px-3 md:px-4 text-gray-600 hidden md:table-cell text-xs md:text-sm">
                      {r.note || '-'}
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
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Điểm danh</h1>
        <p className="text-xs md:text-sm text-gray-600">Sổ đầu bài kỹ thuật số</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3 mb-4 md:mb-6">
        <button className="px-3 md:px-6 py-1.5 md:py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 text-xs md:text-sm">
          📥 Xuất dữ liệu
        </button>
        <button className="px-3 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-xs md:text-sm">
          📤 Đồng bộ Phụ huynh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">BUỔI ĐIỂM DANH</label>
            <select
              value={selectedSessionId ?? ''}
              onChange={(e) => setSelectedSessionId(Number(e.target.value))}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            >
              <option value="">Chọn buổi</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_date} - Buổi {s.session_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">LỚP HỌC</label>
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs md:text-sm"
            >
              <option value="">Chọn Lớp Học</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name} ({c.student_count} HS)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-xs text-gray-500 pb-2">
              {selectedSessionId && selectedClassId
                ? `${students.length} học sinh • ${selectedSessionId ? sessions.find(s => s.session_id === selectedSessionId)?.session_date || '' : ''}`
                : 'Chọn buổi và lớp để điểm danh'}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {selectedClassId && students.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto mb-4 md:mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">MÃ HS</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">HỌC SINH</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px]">TRẠNG THÁI</th>
                  <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] hidden md:table-cell">GHI CHÚ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s: any) => {
                  const currentStatus = attendanceMap[s.student_id] ?? 'Có mặt'
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
                          {(['Có mặt', 'Vắng', 'Trễ', 'Phép'] as AttendanceStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => setStatus(s.student_id, st)}
                              className={`px-2 py-0.5 md:py-1 rounded text-[9px] md:text-[10px] font-semibold transition ${currentStatus === st
                                ? `${STATUS_COLORS[st]} ring-2 ring-blue-400`
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {st}
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
          {selectedSessionId && (
            <div className="p-3 md:p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 text-xs md:text-sm"
              >
                {saving ? 'Đang lưu...' : '💾 Lưu điểm danh'}
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedSessionId && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <p className="text-xs text-gray-500">Chọn một buổi điểm danh để sửa đổi điểm danh</p>
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 && !selectedSessionId && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-gray-900 mb-3">Buổi điểm danh gần đây</h2>
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s: any) => (
              <div
                key={s.session_id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedSessionId(s.session_id)}
              >
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-900">
                    Buổi {s.session_id} - {s.session_date}
                  </p>
                  <p className="text-[10px] text-gray-600">
                    {new Date(s.created_at).toLocaleDateString('vi-VN')}
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
