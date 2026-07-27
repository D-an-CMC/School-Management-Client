'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getClasses, getSubjects, getTimetables, createTimetable, deleteTimetable } from '@/lib/api'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'

// ──────────────────────────────────────────────────────
// Types & Helper Functions
// ──────────────────────────────────────────────────────

interface DbSubject {
  subject_id: number
  subject_code: string
  subject_name: string
}

interface TimetableEntry {
  schedule_id: number
  class_id: number
  subject_id: number
  day_of_week: string // '2'=Mon, '3'=Tue, ..., '7'=Sat
  period_no?: number
  room?: string
  subjects?: DbSubject
}

const DEFAULT_SUBJECTS: DbSubject[] = [
  { subject_id: 1, subject_code: 'TOAN', subject_name: 'Toán học' },
  { subject_id: 2, subject_code: 'VAN', subject_name: 'Ngữ văn' },
  { subject_id: 3, subject_code: 'ENG', subject_name: 'Tiếng Anh' },
  { subject_id: 4, subject_code: 'LY', subject_name: 'Vật lý' },
  { subject_id: 5, subject_code: 'HOA', subject_name: 'Hóa học' },
  { subject_id: 6, subject_code: 'SINH', subject_name: 'Sinh học' },
  { subject_id: 7, subject_code: 'SU', subject_name: 'Lịch sử' },
  { subject_id: 8, subject_code: 'DIA', subject_name: 'Địa lý' },
  { subject_id: 9, subject_code: 'TIN', subject_name: 'Tin học' },
  { subject_id: 10, subject_code: 'TD', subject_name: 'Thể dục' },
  { subject_id: 11, subject_code: 'GDCD', subject_name: 'GDCD' },
  { subject_id: 12, subject_code: 'MT', subject_name: 'Mỹ thuật' },
  { subject_id: 13, subject_code: 'AN', subject_name: 'Âm nhạc' },
]

const MORNING_SLOTS = [
  { period: 1, range: '07:00 - 07:45' },
  { period: 2, range: '07:55 - 08:40' },
  { period: 3, range: '08:50 - 09:35' },
  { period: 4, range: '10:00 - 10:45' },
  { period: 5, range: '10:55 - 11:40' },
]

const AFTERNOON_SLOTS = [
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

function serverDayToFront(dayStr: string): number {
  const num = Number(dayStr)
  if (isNaN(num)) return 0
  return num - 2
}

function frontDayToServer(dayIdx: number): string {
  return String(dayIdx + 2)
}

const CARD_THEMES = [
  { bg: 'bg-[#003366] text-white border-[#003366]', tag: 'bg-white/20 text-white' },
  { bg: 'bg-white text-[#001d36] border-gray-300 shadow-sm', tag: 'bg-blue-50 text-[#003366]' },
  { bg: 'bg-[#00284d] text-white border-[#00284d]', tag: 'bg-white/20 text-white' },
  { bg: 'bg-slate-100 text-[#001d36] border-slate-300 shadow-sm', tag: 'bg-slate-200 text-[#001d36]' },
]

function getSubjectTheme(id: number) {
  return CARD_THEMES[id % CARD_THEMES.length]
}

// ──────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────

export default function AdminTimetablePage() {
  const [mounted, setMounted] = useState<boolean>(false)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<DbSubject[]>(DEFAULT_SUBJECTS)
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('Khối 6')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(1)
  const [selectedRoom, setSelectedRoom] = useState<string>('Tất cả phòng')
  const [selectedSemester, setSelectedSemester] = useState<string>('Học kỳ I - 2023-2024')

  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [loading, setLoading] = useState<boolean>(true)
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  // Cell Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [activeCell, setActiveCell] = useState<{ dayIdx: number; periodNo: number } | null>(null)
  const [activeEntry, setActiveEntry] = useState<TimetableEntry | null>(null)

  // Quick Schedule Form Modal (Header Button)
  const [quickModalOpen, setQuickModalOpen] = useState<boolean>(false)
  const [quickDayIdx, setQuickDayIdx] = useState<number>(0)
  const [quickPeriodNo, setQuickPeriodNo] = useState<number>(1)
  const [quickSubjectId, setQuickSubjectId] = useState<number>(1)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Initial Fetching
  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const [clsRes, subjRes] = await Promise.all([getClasses(), getSubjects()])
        const clsList = clsRes.success ? (clsRes.data ?? []) : []
        setClasses(clsList)

        if (subjRes && subjRes.length > 0) {
          setSubjects(subjRes)
        } else {
          setSubjects(DEFAULT_SUBJECTS)
        }

        if (clsList.length > 0) {
          setSelectedClassId(clsList[0].class_id)
        }
      } catch (err) {
        console.error('Failed to initialize data:', err)
        setSubjects(DEFAULT_SUBJECTS)
      } finally {
        setLoading(false)
      }
    }
    initData()
  }, [])

  // 2. Fetch Timetable Entries when Class changes
  useEffect(() => {
    if (!selectedClassId) return

    async function loadTimetable() {
      setLoadingGrid(true)
      try {
        const res = await getTimetables({ classId: selectedClassId ?? undefined })
        const raw = res.data ?? []
        setEntries(raw)
      } catch (err) {
        console.error('Failed to load timetable:', err)
      } finally {
        setLoadingGrid(false)
      }
    }
    loadTimetable()
  }, [selectedClassId])

  const weekDays = getWeekDays(selectedDateStr)

  function handlePrevWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() - 7)
    setSelectedDateStr(d.toISOString().split('T')[0])
  }

  function handleNextWeek() {
    const d = new Date(selectedDateStr)
    d.setDate(d.getDate() + 7)
    setSelectedDateStr(d.toISOString().split('T')[0])
  }

  function handleToday() {
    setSelectedDateStr(new Date().toISOString().split('T')[0])
  }

  const filteredClasses = classes.filter((c) => {
    if (selectedGrade === 'Khối 6') return c.grade_level === 6 || c.class_name?.startsWith('6')
    if (selectedGrade === 'Khối 7') return c.grade_level === 7 || c.class_name?.startsWith('7')
    if (selectedGrade === 'Khối 8') return c.grade_level === 8 || c.class_name?.startsWith('8')
    if (selectedGrade === 'Khối 9') return c.grade_level === 9 || c.class_name?.startsWith('9')
    return true
  })

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)

  function getEntry(dayIdx: number, periodNo: number): TimetableEntry | undefined {
    return entries.find((e) => {
      const d = serverDayToFront(e.day_of_week)
      const p = e.period_no ?? 1
      return d === dayIdx && p === periodNo
    })
  }

  const displaySubjects = subjects.length > 0 ? subjects : DEFAULT_SUBJECTS

  // Dynamic N-period streak calculation for merging 2, 3, 4... consecutive periods
  function getConsecutiveStreakInfo(
    dayIdx: number,
    periodNo: number,
    sessionSlots: { period: number }[]
  ) {
    const current = getEntry(dayIdx, periodNo)
    const currentSubj = current?.subjects?.subject_id || current?.subject_id

    if (!currentSubj) {
      return { isStart: true, streakLength: 1, isChild: false }
    }

    const sessionStartPeriod = sessionSlots[0].period
    const sessionEndPeriod = sessionSlots[sessionSlots.length - 1].period

    const prevEntry = periodNo > sessionStartPeriod ? getEntry(dayIdx, periodNo - 1) : null
    const prevSubj = prevEntry?.subjects?.subject_id || prevEntry?.subject_id

    if (prevSubj === currentSubj) {
      return { isStart: false, streakLength: 1, isChild: true }
    }

    let streakLength = 1
    for (let p = periodNo + 1; p <= sessionEndPeriod; p++) {
      const nextEntry = getEntry(dayIdx, p)
      const nextSubj = nextEntry?.subjects?.subject_id || nextEntry?.subject_id
      if (nextSubj === currentSubj) {
        streakLength++
      } else {
        break
      }
    }

    return { isStart: true, streakLength, isChild: false }
  }

  function handleCellClick(dayIdx: number, periodNo: number) {
    const existing = getEntry(dayIdx, periodNo)
    setActiveCell({ dayIdx, periodNo })
    setActiveEntry(existing || null)
    setModalOpen(true)
  }

  async function handleAssignSubject(subjectId: number, targetDayIdx?: number, targetPeriodNo?: number) {
    const dayIdx = targetDayIdx !== undefined ? targetDayIdx : activeCell?.dayIdx ?? 0
    const periodNo = targetPeriodNo !== undefined ? targetPeriodNo : activeCell?.periodNo ?? 1
    const targetClassId = selectedClassId || 1

    setSaving(true)
    try {
      const result = await createTimetable({
        classId: targetClassId,
        subjectId,
        semesterId: 1,
        dayOfWeek: frontDayToServer(dayIdx),
        periodNo,
      })

      const selectedSubj = displaySubjects.find((s) => s.subject_id === subjectId) || {
        subject_id: subjectId,
        subject_code: 'MON',
        subject_name: 'Môn học',
      }

      const newEntry: TimetableEntry = {
        schedule_id: result.success ? result.data?.[0]?.schedule_id || Date.now() : Date.now(),
        class_id: targetClassId,
        subject_id: subjectId,
        day_of_week: frontDayToServer(dayIdx),
        period_no: periodNo,
        subjects: selectedSubj,
      }

      setEntries((prev) => [
        ...prev.filter(
          (e) => !(serverDayToFront(e.day_of_week) === dayIdx && e.period_no === periodNo)
        ),
        newEntry,
      ])
      setModalOpen(false)
      setQuickModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Đã xảy ra lỗi khi gán môn học.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteSubject() {
    if (!activeEntry) return
    setSaving(true)
    try {
      await deleteTimetable(activeEntry.schedule_id)
      setEntries((prev) => prev.filter((e) => e.schedule_id !== activeEntry.schedule_id))
      setModalOpen(false)
    } catch (err) {
      console.error(err)
      setEntries((prev) => prev.filter((e) => e.schedule_id !== activeEntry.schedule_id))
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Đang tải dữ liệu thời khóa biểu...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-6 p-6 bg-[#f9f9ff] min-h-screen">
      {/* ────────────────────────────────────────────────── */}
      {/* Breadcrumbs & Title Section */}
      {/* ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
          <span>Hệ thống</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#001d36]">Thời khóa biểu</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-[#111c2d]">Quản lý Thời khóa biểu</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-[#111c2d] hover:bg-gray-50 transition-colors shadow-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">history</span>
              <span>Lịch sử thay đổi</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-[#111c2d] hover:bg-gray-50 transition-colors shadow-sm text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Xuất file Excel</span>
            </button>

            {/* Main Header "Sắp xếp thời khóa biểu" Button */}
            <button
              onClick={() => setQuickModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#001d36] text-white hover:bg-[#00284d] transition-all shadow-md text-xs font-semibold cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Sắp xếp thời khóa biểu</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Stats Row */}
      {/* ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#003366] flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lớp đã xếp lịch</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">
              42<span className="text-xs text-gray-500 font-normal">/45</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-full border-4 border-blue-100 border-t-[#003366] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[#003366]">93%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-gray-500 flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Công suất phòng</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">85%</span>
          </div>
          <div className="w-11 h-11 rounded-full border-4 border-gray-100 border-t-gray-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">meeting_room</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-600 flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Giờ giảng trung bình</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">18.5</span>
          </div>
          <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-[20px]">timer</span>
          </div>
        </div>

        {/* Card 4: Interactive Calendar Date Selector */}
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

      {/* ────────────────────────────────────────────────── */}
      {/* Filter Bar */}
      {/* ────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-4 shadow-sm border border-gray-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {/* Học kỳ */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Học kỳ</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003366]"
            >
              <option>Học kỳ I - 2023-2024</option>
              <option>Học kỳ II - 2023-2024</option>
            </select>
          </div>

          {/* Khối */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Khối</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003366]"
            >
              <option>Khối 6</option>
              <option>Khối 7</option>
              <option>Khối 8</option>
              <option>Khối 9</option>
            </select>
          </div>

          {/* Lớp */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Lớp</label>
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003366]"
            >
              {filteredClasses.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
              {filteredClasses.length === 0 && <option value="1">Lớp 6A1 (Mặc định)</option>}
            </select>
          </div>

          {/* Phòng học */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phòng học</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#003366]"
            >
              <option>Tất cả phòng</option>
              <option>P.101</option>
              <option>P.102</option>
              <option>P.201</option>
              <option>Lab IT</option>
              <option>Lab 02</option>
            </select>
          </div>
        </div>

        <button className="self-end md:self-center p-2.5 bg-[#001d36] text-white rounded-lg hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">filter_alt</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Main Timetable Grid View */}
      {/* ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div className="min-w-[960px]">
          {/* Dynamic Date Header Row */}
          <div className="grid grid-cols-[140px_repeat(6,1fr)] bg-gray-100/80 border-b border-gray-200 text-[#111c2d]">
            <div className="p-3 border-r border-gray-200 text-[11px] font-bold text-center uppercase tracking-widest text-gray-500 flex items-center justify-center">
              TIẾT / GIỜ
            </div>
            {weekDays.map((d) => (
              <div
                key={d.isoDate}
                onClick={() => setSelectedDateStr(d.isoDate)}
                className={`p-3 border-r last:border-r-0 border-gray-200 text-center cursor-pointer transition-colors ${
                  d.isCurrentSelected ? 'bg-[#003366] text-white shadow-md' : 'hover:bg-gray-200/60'
                }`}
              >
                <div className={`text-sm font-bold ${d.isCurrentSelected ? 'text-white' : 'text-[#001d36]'}`}>
                  {d.label}
                </div>
                <div className={`text-[11px] font-semibold mt-0.5 ${d.isCurrentSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {d.dateStr}
                </div>
                {d.isCurrentSelected && (
                  <span className="mt-1 inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-white text-[#003366] rounded-full">
                    Đang xem
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Loading Overlay */}
          {loadingGrid && (
            <div className="p-12 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#003366] border-t-transparent" />
            </div>
          )}

          {!loadingGrid && (
            <div className="flex flex-col divide-y divide-gray-200">
              {/* SÁNG */}
              <div className="bg-blue-50/40 px-4 py-2 font-bold text-xs text-[#003366] flex items-center gap-2 border-b border-gray-200">
                <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                <span className="tracking-wider">BUỔI SÁNG</span>
              </div>

              {MORNING_SLOTS.map((slot) => (
                <div
                  key={'m-slot-' + slot.period}
                  className="grid grid-cols-[140px_repeat(6,1fr)] divide-x divide-gray-200 min-h-[88px]"
                >
                  <div className="p-3 bg-gray-50 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-bold text-[#001d36]">Tiết {slot.period}</span>
                    <span className="text-[11px] font-medium text-gray-500 mt-0.5">{slot.range}</span>
                  </div>

                  {weekDays.map((d) => {
                    const entry = getEntry(d.dayIdx, slot.period)
                    const subject = entry?.subjects || (entry?.subject_id ? displaySubjects.find((s) => s.subject_id === entry.subject_id) : undefined)
                    const theme = subject ? getSubjectTheme(subject.subject_id) : null

                    const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, MORNING_SLOTS)

                    if (streak.isChild) {
                      return (
                        <div key={`m-cell-${d.dayIdx}-${slot.period}`} className="p-1.5 h-[88px] opacity-0 pointer-events-none" />
                      )
                    }

                    const streakLen = streak.streakLength
                    const isMulti = streakLen > 1
                    const cardHeight = isMulti
                      ? `h-[${streakLen * 88 + (streakLen - 1) * 4}px] z-10 relative mb-[-${(streakLen - 1) * 92}px]`
                      : 'h-[88px]'

                    // Dynamic font size scaling as consecutive periods increase (2, 3, 4...)
                    const titleFontSize =
                      streakLen === 1
                        ? 'text-xs font-bold'
                        : streakLen === 2
                        ? 'text-sm font-extrabold'
                        : streakLen === 3
                        ? 'text-base font-black'
                        : 'text-lg font-black tracking-wide'

                    return (
                      <div
                        key={`m-cell-${d.dayIdx}-${slot.period}`}
                        onClick={() => handleCellClick(d.dayIdx, slot.period)}
                        className={`p-1.5 ${cardHeight} flex flex-col cursor-pointer transition-all ${
                          d.isCurrentSelected ? 'bg-blue-50/50 ring-1 ring-[#003366]/30' : 'hover:bg-blue-50/20'
                        }`}
                        style={
                          isMulti
                            ? {
                                height: `${streakLen * 88 + (streakLen - 1) * 4}px`,
                                marginBottom: `-${(streakLen - 1) * 92}px`,
                                zIndex: 10,
                                position: 'relative',
                              }
                            : {}
                        }
                      >
                        {subject ? (
                          <div
                            className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isMulti && (
                                  <span className="text-[10px] font-bold opacity-90 block mt-1 bg-white/20 px-2 py-0.5 rounded-full w-fit">
                                    Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                                {subject.subject_code || 'MON'}
                              </span>
                            </div>
                            <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                              <span className="truncate">GV: {selectedClass?.homeroom_teacher_name || 'Phân công'}</span>
                              <span className="font-semibold">{selectedRoom !== 'Tất cả phòng' ? selectedRoom : 'P.302'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#003366] hover:text-[#003366] transition-colors group">
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add</span>
                            <span className="text-[10px] font-semibold mt-0.5 opacity-70">Xếp tiết</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* CHIỀU */}
              <div className="bg-amber-50/40 px-4 py-2 font-bold text-xs text-amber-900 flex items-center gap-2 border-y border-gray-200">
                <span className="material-symbols-outlined text-[18px]">bedtime</span>
                <span className="tracking-wider">BUỔI CHIỀU</span>
              </div>

              {AFTERNOON_SLOTS.map((slot) => (
                <div
                  key={'a-slot-' + slot.period}
                  className="grid grid-cols-[140px_repeat(6,1fr)] divide-x divide-gray-200 min-h-[88px]"
                >
                  <div className="p-3 bg-gray-50 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-bold text-[#001d36]">Tiết {slot.period}</span>
                    <span className="text-[11px] font-medium text-gray-500 mt-0.5">{slot.range}</span>
                  </div>

                  {weekDays.map((d) => {
                    const entry = getEntry(d.dayIdx, slot.period)
                    const subject = entry?.subjects || (entry?.subject_id ? displaySubjects.find((s) => s.subject_id === entry.subject_id) : undefined)
                    const theme = subject ? getSubjectTheme(subject.subject_id) : null

                    const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, AFTERNOON_SLOTS)

                    if (streak.isChild) {
                      return (
                        <div key={`a-cell-${d.dayIdx}-${slot.period}`} className="p-1.5 h-[88px] opacity-0 pointer-events-none" />
                      )
                    }

                    const streakLen = streak.streakLength
                    const isMulti = streakLen > 1

                    const titleFontSize =
                      streakLen === 1
                        ? 'text-xs font-bold'
                        : streakLen === 2
                        ? 'text-sm font-extrabold'
                        : streakLen === 3
                        ? 'text-base font-black'
                        : 'text-lg font-black tracking-wide'

                    return (
                      <div
                        key={`a-cell-${d.dayIdx}-${slot.period}`}
                        onClick={() => handleCellClick(d.dayIdx, slot.period)}
                        className={`p-1.5 flex flex-col cursor-pointer transition-all ${
                          d.isCurrentSelected ? 'bg-amber-50/40 ring-1 ring-amber-500/30' : 'hover:bg-amber-50/20'
                        }`}
                        style={
                          isMulti
                            ? {
                                height: `${streakLen * 88 + (streakLen - 1) * 4}px`,
                                marginBottom: `-${(streakLen - 1) * 92}px`,
                                zIndex: 10,
                                position: 'relative',
                              }
                            : { height: '88px' }
                        }
                      >
                        {subject ? (
                          <div
                            className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isMulti && (
                                  <span className="text-[10px] font-bold opacity-90 block mt-1 bg-white/20 px-2 py-0.5 rounded-full w-fit">
                                    Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                                {subject.subject_code || 'MON'}
                              </span>
                            </div>
                            <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                              <span className="truncate">GV: {selectedClass?.homeroom_teacher_name || 'Phân công'}</span>
                              <span className="font-semibold">{selectedRoom !== 'Tất cả phòng' ? selectedRoom : 'P.302'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-[#003366] hover:text-[#003366] transition-colors group">
                            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add</span>
                            <span className="text-[10px] font-semibold mt-0.5 opacity-70">Xếp tiết</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Portaled Modals */}
      {/* ────────────────────────────────────────────────── */}
      {mounted &&
        modalOpen &&
        activeCell &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col w-full animate-in fade-in zoom-in-95 duration-150"
              style={{
                width: '100%',
                maxWidth: '540px',
                minWidth: '320px',
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#001d36] text-white">
                <div>
                  <h3 className="text-base font-bold">
                    {activeEntry ? 'Chi tiết tiết học' : 'Phân công môn học'}
                  </h3>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">
                    {weekDays[activeCell.dayIdx]?.label} ({weekDays[activeCell.dayIdx]?.dateStr}) — Tiết {activeCell.periodNo} ({selectedClass?.class_name || 'Lớp 6A1'})
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
                {activeEntry && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-red-900">
                        Môn hiện tại: {activeEntry.subjects?.subject_name || 'Đã xếp môn'}
                      </p>
                      <p className="text-[11px] text-red-700 font-medium">Xóa phân công của tiết học này?</p>
                    </div>
                    <button
                      onClick={handleDeleteSubject}
                      disabled={saving}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Đang xóa...' : 'Xóa tiết'}
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    {activeEntry ? 'Thay đổi sang môn học khác:' : 'Chọn môn học gán vào tiết:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {displaySubjects.map((subj) => {
                      const theme = getSubjectTheme(subj.subject_id)
                      return (
                        <button
                          key={subj.subject_id}
                          onClick={() => handleAssignSubject(subj.subject_id)}
                          disabled={saving}
                          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between hover:scale-[1.03] active:scale-95 transition-all ${theme.bg} disabled:opacity-50 min-h-[76px] cursor-pointer shadow-xs`}
                        >
                          <span className="text-xs font-bold leading-tight">{subj.subject_name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold self-start mt-2 ${theme.tag}`}>
                            {subj.subject_code || 'MON'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Quick Schedule Modal */}
      {mounted &&
        quickModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
            }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col w-full animate-in fade-in zoom-in-95 duration-150"
              style={{
                width: '100%',
                maxWidth: '540px',
                minWidth: '320px',
              }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#001d36] text-white">
                <div>
                  <h3 className="text-base font-bold">Sắp xếp Thời khóa biểu nhanh</h3>
                  <p className="text-xs text-blue-200 font-medium mt-0.5">
                    Phân công môn học vào các tiết cho lớp {selectedClass?.class_name || '6A1'}
                  </p>
                </div>
                <button
                  onClick={() => setQuickModalOpen(false)}
                  className="text-white/80 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Thứ Select */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Chọn Thứ trong tuần:</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {weekDays.map((w) => (
                      <button
                        key={w.dayIdx}
                        onClick={() => setQuickDayIdx(w.dayIdx)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          quickDayIdx === w.dayIdx
                            ? 'bg-[#003366] text-white border-[#003366]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tiết Select */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Chọn Tiết học:</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <button
                        key={p}
                        onClick={() => setQuickPeriodNo(p)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          quickPeriodNo === p
                            ? 'bg-[#003366] text-white border-[#003366]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Tiết {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Môn Select */}
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">Chọn môn học gán vào Tiết {quickPeriodNo}:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[35vh] overflow-y-auto p-0.5">
                    {displaySubjects.map((subj) => {
                      const isSelected = quickSubjectId === subj.subject_id
                      const theme = getSubjectTheme(subj.subject_id)
                      return (
                        <button
                          key={subj.subject_id}
                          onClick={() => setQuickSubjectId(subj.subject_id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            isSelected
                              ? 'bg-[#003366] text-white border-[#003366] ring-2 ring-[#003366]/40 shadow-md'
                              : `${theme.bg} hover:scale-[1.02]`
                          } cursor-pointer min-h-[72px]`}
                        >
                          <span className="text-xs font-bold leading-tight">{subj.subject_name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold self-start mt-2 ${
                            isSelected ? 'bg-white/20 text-white' : theme.tag
                          }`}>
                            {subj.subject_code || 'MON'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
                <button
                  onClick={() => setQuickModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleAssignSubject(quickSubjectId, quickDayIdx, quickPeriodNo)}
                  disabled={saving}
                  className="px-5 py-2 bg-[#001d36] hover:bg-[#00284d] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {saving ? 'Đang lưu...' : 'Lưu gán tiết'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
