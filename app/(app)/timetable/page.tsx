'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'
import { getMyTimetable, getSemesters } from '@/lib/api'
import AdminStyleTimetableGrid from './admin-style-grid'

// ──────────────────────────────────────────────────────
// Types & Helper Functions
// ──────────────────────────────────────────────────────

const MORNING_PERIODS = [  { period: 1, range: '07:00 - 07:45' },
  { period: 2, range: '07:55 - 08:40' },
  { period: 3, range: '08:50 - 09:35' },
  { period: 4, range: '10:00 - 10:45' },
  { period: 5, range: '10:55 - 11:40' },
]

const AFTERNOON_PERIODS = [
  { period: 6, range: '13:00 - 13:45' },
  { period: 7, range: '13:55 - 14:40' },
  { period: 8, range: '14:50 - 15:35' },
  { period: 9, range: '15:50 - 16:35' },
  { period: 10, range: '16:45 - 17:30' },
]

function getMondayOfDate(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

// First Monday on/after a date (matches the weeks the server stores as week_start).
// Uses UTC exactly like the server's mondayOf(), so week matching is timezone-safe.
function firstMondayAtOrAfter(isoStr: string): string {
  const d = new Date(`${isoStr}T00:00:00Z`)
  if (isNaN(d.getTime())) return isoStr
  const day = d.getUTCDay()
  const delta = day === 1 ? 0 : day === 0 ? 1 : 8 - day
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().split('T')[0]
}

function getWeekDays(currentDateStr: string) {
  const current = new Date(currentDateStr)
  const monday = getMondayOfDate(isNaN(current.getTime()) ? new Date() : current)
  const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

  return Array.from({ length: 6 }, (_, i) => {
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)
    const isoStr = dayDate.toISOString().split('T')[0]
    const dayNum = String(dayDate.getDate()).padStart(2, '0')
    const monthNum = String(dayDate.getMonth() + 1).padStart(2, '0')

    return {
      label: dayLabels[i],
      dateStr: `${dayNum}/${monthNum}`,
      isoDate: isoStr,
      isCurrentSelected: isoStr === currentDateStr,
      dayIdx: i,
    }
  })
}

function formatDateVietnamese(isoStr: string) {
  const d = new Date(isoStr)
  if (isNaN(d.getTime())) return ''
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayName = days[d.getDay()]
  const dayNum = String(d.getDate()).padStart(2, '0')
  const monthNum = String(d.getMonth() + 1).padStart(2, '0')
  const yearNum = d.getFullYear()
  return `${dayName}, ${dayNum}/${monthNum}/${yearNum}`
}


// ------------------------------------------------------
// Teacher View
// ------------------------------------------------------

function TeacherTimetablePage({ userName }: { userName: string }) {
  const { selectedSemesterId, setSelectedSemesterId, selectedSchoolYearId, currentSchoolYear } = useAcademic()
  const [entries, setEntries] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [totalPeriods, setTotalPeriods] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [semesters, setSemesters] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const reqSeq = useRef(0)
  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? null

  useEffect(() => {
    getSemesters().then(sems => {
      const list = Array.isArray(sems) ? sems : []
      setSemesters(list)
      if (list.length > 0) {
        const active = list.find((s: any) => Number(s.semester_id) === Number(selectedSemesterId)) || list.find((s: any) => s.is_active) || list[0]
        if (active?.start_date) setSelectedDateStr(firstMondayAtOrAfter(active.start_date))
        else if (active?.end_date) setSelectedDateStr(firstMondayAtOrAfter(active.end_date))
      }
    }).catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync the viewed week to the newly selected semester's start (semester is
  // chosen in the Header), so the schedule isn't stuck on a date from another term.
  useEffect(() => {
    if (semesters.length === 0 || selectedSemesterId == null) return
    const chosen = semesters.find((s: any) => Number(s.semester_id) === Number(selectedSemesterId))
    if (chosen?.start_date) setSelectedDateStr(firstMondayAtOrAfter(chosen.start_date))
    else if (chosen?.end_date) setSelectedDateStr(firstMondayAtOrAfter(chosen.end_date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemesterId, semesters.length])

  useEffect(() => {
    if (selectedSemesterId == null) return
    const seq = ++reqSeq.current
    setLoadingData(true)
    getMyTimetable({ semesterId: selectedSemesterId, weekStart: selectedDateStr }).then(res => {
      if (seq !== reqSeq.current) return
      const data = res.data ?? []
      setEntries(data)
      setTotalPeriods(data.length)
      const uniqueClasses = new Set(data.map((e: any) => e.class_id).filter(Boolean))
      setClassCount(uniqueClasses.size)
    }).catch(() => {
      if (seq !== reqSeq.current) return
      setEntries([])
      setTotalPeriods(0)
      setClassCount(0)
    }).finally(() => {
      if (seq !== reqSeq.current) return
      setLoadingData(false)
    })
  }, [selectedSemesterId, selectedDateStr])

  function handlePrevWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() - 7)
    selectDateAndSyncSemester(d.toISOString().split('T')[0])
  }

  function handleNextWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() + 7)
    selectDateAndSyncSemester(d.toISOString().split('T')[0])
  }

  function handleToday() {
    selectDateAndSyncSemester(new Date().toISOString().split('T')[0])
  }

  function selectDateAndSyncSemester(dateStr: string) {
    const yearSems = semesters.filter((s: any) => !effectiveYearId || Number(s.school_year_id) === Number(effectiveYearId))
    const target = (yearSems as any[]).find((s: any) => {
      const start = s.start_date ? new Date(s.start_date) : null
      const end = s.end_date ? new Date(s.end_date) : null
      const d = new Date(dateStr)
      if (start && end) return d >= start && d <= end
      if (start) return d >= start
      return false
    })
    if (target) setSelectedSemesterId(Number(target.semester_id))
    setSelectedDateStr(dateStr)
  }

  if (loadingData && semesters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Đang tải lịch giảng dạy...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-[#f9f9ff] min-h-screen">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Cá nhân</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#001d36]">Thời khóa biểu giảng dạy</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#111c2d]">Lịch Giảng Dạy — {userName || 'Giáo viên'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-[#111c2d] hover:bg-gray-50 transition-colors shadow-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>In lịch dạy</span>
          </button>
        </div>
      </div>

      {/* Teacher Stats (With Interactive Calendar Date Picker) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#003366] flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tổng tiết dạy</span>
            <span className="text-2xl font-extrabold text-[#001d36] block mt-1">{totalPeriods} Tiết</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366]">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-emerald-600 flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lớp phụ trách</span>
            <span className="text-2xl font-extrabold text-[#001d36] block mt-1">{classCount} Lớp</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[20px]">groups</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-amber-500 flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ràng buộc giảng dạy</span>
            <span className="text-sm font-bold text-[#001d36] block mt-1">{classCount <= 3 ? 'Hợp lệ' : 'Vượt giới hạn'}</span>
            <span className="text-[10px] text-gray-500 font-medium">{classCount}/3 lớp tối đa</span>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classCount <= 3 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
            <span className="material-symbols-outlined text-[20px]">{classCount <= 3 ? 'check_circle' : 'warning'}</span>
          </div>
        </div>

        {/* Calendar Picker Card */}
        <div className="bg-white p-3.5 rounded-xl shadow-sm border-t-4 border-[#003366] flex flex-col justify-between">
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#003366]">calendar_month</span>
                <span>Lịch xem thời khóa biểu</span>
              </span>
              <p className="text-xs font-bold text-[#001d36] mt-0.5">
                {formatDateVietnamese(selectedDateStr)}
              </p>
            </div>
            <div className="w-36 shrink-0">
              <CustomDatePicker
                value={selectedDateStr}
                onChange={(val) => val && setSelectedDateStr(val)}
                placeholder="dd/mm/yyyy"
                minYear={2020}
                maxYear={2035}
                align="right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-1">
            <button
              onClick={handlePrevWeek}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[12px]">chevron_left</span>
              <span>Tuần trước</span>
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#003366] rounded text-[10px] font-bold transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextWeek}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors flex items-center gap-0.5"
            >
              <span>Tuần sau</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Grid */}
      <AdminStyleTimetableGrid
        entries={entries}
        selectedDateStr={selectedDateStr}
        onSelectDate={selectDateAndSyncSemester}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Student View
// ──────────────────────────────────────────────────────

function StudentTimetablePage({ userName }: { userName: string }) {
  const { selectedSemesterId, setSelectedSemesterId, selectedSchoolYearId, currentSchoolYear } = useAcademic()
  const [entries, setEntries] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [className, setClassName] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [subjectCount, setSubjectCount] = useState(0)
  const [semesters, setSemesters] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const reqSeq = useRef(0)
  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? null

  useEffect(() => {
    getSemesters().then(sems => {
      const list = Array.isArray(sems) ? sems : []
      setSemesters(list)
      if (list.length > 0) {
        const active = (list.find((s: any) => Number(s.semester_id) === Number(selectedSemesterId)) || list.find((s: any) => s.is_active) || list[0]) as any
        if (active?.start_date) setSelectedDateStr(firstMondayAtOrAfter(active.start_date))
        else if (active?.end_date) setSelectedDateStr(firstMondayAtOrAfter(active.end_date))
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedSemesterId == null) return
    const seq = ++reqSeq.current
    setLoadingData(true)
    setEntries([])
    setClassName(null)
    setRoomName(null)
    setSubjectCount(0)
    getMyTimetable({ semesterId: selectedSemesterId, weekStart: selectedDateStr }).then(res => {
      if (seq !== reqSeq.current) return
      const data = res.data ?? []
      setEntries(data)
      if (data.length > 0) {
        setClassName(res.className ?? null)
        setRoomName(res.roomName ?? null)
        const uniqueSubjects = new Set(data.map((e: any) => e.subject_id).filter(Boolean))
        setSubjectCount(uniqueSubjects.size)
      }
    }).catch(() => {
      if (seq !== reqSeq.current) return
      // On network/API error, keep the grid empty rather than guessing.
      setEntries([])
    }).finally(() => {
      if (seq !== reqSeq.current) return
      setLoadingData(false)
    })
  }, [selectedDateStr, selectedSemesterId])

  // Tasks / homework list (placeholder — will be replaced by real data when assignments module is ready)
  const tasks = [
    { id: 1, title: 'Bài tập Toán trang 45', subject: 'Toán học', due: 'Thứ 3', urgent: true },
    { id: 2, title: 'Soạn bài Cô bé bán diêm', subject: 'Ngữ văn', due: 'Thứ 4', urgent: false },
    { id: 3, title: 'Học từ vựng Unit 3', subject: 'Tiếng Anh', due: 'Thứ 5', urgent: false },
    { id: 4, title: 'Ôn tập chương 2 Lý', subject: 'Vật lý', due: 'Thứ 6', urgent: true },
  ]

  function handlePrevWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() - 7)
    selectDateAndSyncSemester(d.toISOString().split('T')[0])
  }

  function handleNextWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() + 7)
    selectDateAndSyncSemester(d.toISOString().split('T')[0])
  }

  function handleToday() {
    selectDateAndSyncSemester(new Date().toISOString().split('T')[0])
  }

  function selectDateAndSyncSemester(dateStr: string) {
    const yearSems = semesters.filter((s: any) => !effectiveYearId || Number(s.school_year_id) === Number(effectiveYearId))
    const target = (yearSems as any[]).find((s: any) => {
      const start = s.start_date ? new Date(s.start_date) : null
      const end = s.end_date ? new Date(s.end_date) : null
      const d = new Date(dateStr)
      if (start && end) return d >= start && d <= end
      if (start) return d >= start
      return false
    })
    if (target) setSelectedSemesterId(Number(target.semester_id))
    setSelectedDateStr(dateStr)
  }

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Đang tải thời khóa biểu...</p>
      </div>
    )
  }

  const totalPeriods = entries.length
  const completionPct = totalPeriods > 0 ? Math.min(100, Math.round((totalPeriods / 30) * 100)) : 0

  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-[#f9f9ff] min-h-screen">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <nav className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Học sinh</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#001d36]">Thời khóa biểu học tập</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#111c2d]">Thời Khóa Biểu
            {className ? ` — Lớp ${className}` : ''}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Chúc {userName || 'bạn'} một tuần học tập thật năng lượng!</p>
        </div>

        {/* Notice Card */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs">
          <span className="text-xl">🔔</span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kiểm tra sắp tới</p>
            <p className="text-xs font-bold text-[#001d36]">Toán học (Tiết 3 - Thứ 4)</p>
          </div>
        </div>
      </div>

      {/* Top Banner Row with Interactive Date Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#003366] flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tổng số môn học</span>
            <span className="text-2xl font-extrabold text-[#001d36] block mt-1">{subjectCount} Môn</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366]">
            <span className="material-symbols-outlined text-[20px]">school</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-emerald-600 flex justify-between items-start">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phòng học cố định</span>
            <span className="text-2xl font-extrabold text-[#001d36] block mt-1">{roomName || '—'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
            <span className="material-symbols-outlined text-[20px]">door_sliding</span>
          </div>
        </div>

        {/* Interactive Calendar Card */}
        <div className="bg-white p-3.5 rounded-xl shadow-sm border-t-4 border-[#003366] flex flex-col justify-between">
          <div className="flex justify-between items-center gap-2">
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#003366]">calendar_month</span>
                <span>Lịch xem thời khóa biểu</span>
              </span>
              <p className="text-xs font-bold text-[#001d36] mt-0.5">
                {formatDateVietnamese(selectedDateStr)}
              </p>
            </div>
            <div className="w-36 shrink-0">
              <CustomDatePicker
                value={selectedDateStr}
                onChange={(val) => val && selectDateAndSyncSemester(val)}
                placeholder="dd/mm/yyyy"
                minYear={2020}
                maxYear={2035}
                align="right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-1">
            <button
              onClick={handlePrevWeek}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[12px]">chevron_left</span>
              <span>Tuần trước</span>
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-[#003366] rounded text-[10px] font-bold transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={handleNextWeek}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-bold text-gray-700 transition-colors flex items-center gap-0.5"
            >
              <span>Tuần sau</span>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <AdminStyleTimetableGrid
        entries={entries}
        selectedDateStr={selectedDateStr}
        onSelectDate={selectDateAndSyncSemester}
      />

      {/* Bottom Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold text-[#001d36] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">assignment</span>
            <span>Nhiệm vụ & Bài tập tuần này</span>
          </h3>

          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between hover:bg-gray-100/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${t.urgent ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{t.title}</p>
                    <span className="text-[10px] text-gray-500 font-semibold">{t.subject}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    t.urgent ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {t.due}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#003366] text-white p-6 rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest block">Tiến độ hoàn thành</span>
            <h3 className="text-3xl font-extrabold mt-1">{completionPct}% Bài học</h3>
          <p className="text-xs opacity-90 font-medium mt-2 leading-relaxed">
            Bạn đang có {totalPeriods} tiết học được xếp lịch trong tuần. Hãy tham gia đầy đủ!
          </p>
          </div>

          <div className="mt-6">
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Entry Point Component
// ──────────────────────────────────────────────────────

export default function TimetablePage() {
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()

  if (role === 'admin') {
    return (
      <div className="p-8 max-w-xl mx-auto text-center flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined text-[48px] text-[#003366]">admin_panel_settings</span>
        <h2 className="text-xl font-bold text-[#001d36] mt-4">Trang Thời khóa biểu Admin</h2>
        <p className="text-xs text-gray-500 mt-2 mb-6">
          Bạn đang đăng nhập với quyền Admin. Vui lòng truy cập trang Quản lý Thời khóa biểu dành riêng cho Admin để xếp lịch và quản lý.
        </p>
        <Link
          href="/admin-timetable"
          className="px-6 py-2.5 bg-[#001d36] text-white text-xs font-bold rounded-full hover:opacity-90 transition-all shadow-md"
        >
          Đi tới Quản lý Thời khóa biểu Admin
        </Link>
      </div>
    )
  }

  if (role === 'teacher' || role === 'giaovien') {
    return <TeacherTimetablePage userName={user?.name || 'Giáo viên'} />
  }

  return <StudentTimetablePage userName={user?.name || 'Học sinh'} />
}
