'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'
import { getMyTimetable } from '@/lib/api'

// ──────────────────────────────────────────────────────
// Types & Helper Functions
// ──────────────────────────────────────────────────────

interface TimetableSlot {
  periodNo: number
  subjectName: string
  subjectCode: string
  teacherOrClass: string
  room: string
  colorThemeIdx: number
}

const MORNING_PERIODS = [
  { period: 1, range: '07:00 - 07:45' },
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

const CARD_THEMES = [
  { bg: 'bg-[#003366] text-white border-[#003366]', tag: 'bg-white/20 text-white' },
  { bg: 'bg-white text-[#001d36] border-gray-300 shadow-sm', tag: 'bg-blue-50 text-[#003366]' },
  { bg: 'bg-[#00284d] text-white border-[#00284d]', tag: 'bg-white/20 text-white' },
  { bg: 'bg-slate-100 text-[#001d36] border-slate-300 shadow-sm', tag: 'bg-slate-200 text-[#001d36]' },
  { bg: 'bg-emerald-800 text-white border-emerald-800', tag: 'bg-white/20 text-white' },
]

function getTheme(idx: number) {
  return CARD_THEMES[idx % CARD_THEMES.length]
}

// ──────────────────────────────────────────────────────
// Mock Data Generators
// ──────────────────────────────────────────────────────

function getStudentMockSchedule(): Record<string, TimetableSlot> {
  return {
    '0-1': { periodNo: 1, subjectName: 'Chào cờ', subjectCode: 'CC', teacherOrClass: 'Toàn trường', room: 'Sân trường', colorThemeIdx: 0 },
    '0-2': { periodNo: 2, subjectName: 'Toán học', subjectCode: 'TOAN', teacherOrClass: 'Thầy Nam', room: 'P.302', colorThemeIdx: 1 },
    '0-3': { periodNo: 3, subjectName: 'Toán học', subjectCode: 'TOAN', teacherOrClass: 'Thầy Nam', room: 'P.302', colorThemeIdx: 1 },
    '0-4': { periodNo: 4, subjectName: 'Ngữ văn', subjectCode: 'VAN', teacherOrClass: 'Cô Hoa', room: 'P.302', colorThemeIdx: 2 },
    '0-5': { periodNo: 5, subjectName: 'Ngữ văn', subjectCode: 'VAN', teacherOrClass: 'Cô Hoa', room: 'P.302', colorThemeIdx: 2 },

    '1-1': { periodNo: 1, subjectName: 'Vật lý', subjectCode: 'LY', teacherOrClass: 'Thầy Hùng', room: 'P.401', colorThemeIdx: 3 },
    '1-2': { periodNo: 2, subjectName: 'Hóa học', subjectCode: 'HOA', teacherOrClass: 'Cô Mai', room: 'Lab 02', colorThemeIdx: 1 },
    '1-3': { periodNo: 3, subjectName: 'Tiếng Anh', subjectCode: 'ENG', teacherOrClass: 'Ms. Nga', room: 'P.302', colorThemeIdx: 0 },
    '1-4': { periodNo: 4, subjectName: 'Tiếng Anh', subjectCode: 'ENG', teacherOrClass: 'Ms. Nga', room: 'P.302', colorThemeIdx: 0 },
    '1-5': { periodNo: 5, subjectName: 'Lịch sử', subjectCode: 'SU', teacherOrClass: 'Cô Lan', room: 'P.302', colorThemeIdx: 3 },

    '2-1': { periodNo: 1, subjectName: 'Sinh học', subjectCode: 'SINH', teacherOrClass: 'Thầy Bình', room: 'P.302', colorThemeIdx: 0 },
    '2-2': { periodNo: 2, subjectName: 'Địa lý', subjectCode: 'DIA', teacherOrClass: 'Cô Tuyết', room: 'P.302', colorThemeIdx: 1 },
    '2-3': { periodNo: 3, subjectName: 'Toán học', subjectCode: 'TOAN', teacherOrClass: 'Thầy Nam', room: 'P.302', colorThemeIdx: 0 },
    '2-4': { periodNo: 4, subjectName: 'Ngữ văn', subjectCode: 'VAN', teacherOrClass: 'Cô Hoa', room: 'P.302', colorThemeIdx: 3 },
    '2-5': { periodNo: 5, subjectName: 'GDCD', subjectCode: 'GDCD', teacherOrClass: 'Thầy Minh', room: 'P.302', colorThemeIdx: 2 },

    '3-1': { periodNo: 1, subjectName: 'Tin học', subjectCode: 'TIN', teacherOrClass: 'Thầy Sơn', room: 'Lab IT', colorThemeIdx: 1 },
    '3-2': { periodNo: 2, subjectName: 'Tin học', subjectCode: 'TIN', teacherOrClass: 'Thầy Sơn', room: 'Lab IT', colorThemeIdx: 1 },
    '3-3': { periodNo: 3, subjectName: 'Tiếng Anh', subjectCode: 'ENG', teacherOrClass: 'Ms. Nga', room: 'P.302', colorThemeIdx: 0 },
    '3-4': { periodNo: 4, subjectName: 'Vật lý', subjectCode: 'LY', teacherOrClass: 'Thầy Hùng', room: 'P.401', colorThemeIdx: 3 },
    '3-5': { periodNo: 5, subjectName: 'Thể dục', subjectCode: 'TD', teacherOrClass: 'Thầy Cường', room: 'Sân tập', colorThemeIdx: 4 },

    '4-1': { periodNo: 1, subjectName: 'Toán học', subjectCode: 'TOAN', teacherOrClass: 'Thầy Nam', room: 'P.302', colorThemeIdx: 1 },
    '4-2': { periodNo: 2, subjectName: 'Ngữ văn', subjectCode: 'VAN', teacherOrClass: 'Cô Hoa', room: 'P.302', colorThemeIdx: 0 },
    '4-3': { periodNo: 3, subjectName: 'Tiếng Anh', subjectCode: 'ENG', teacherOrClass: 'Ms. Nga', room: 'P.302', colorThemeIdx: 3 },
    '4-4': { periodNo: 4, subjectName: 'Hóa học', subjectCode: 'HOA', teacherOrClass: 'Cô Mai', room: 'Lab 02', colorThemeIdx: 2 },
    '4-5': { periodNo: 5, subjectName: 'Lịch sử', subjectCode: 'SU', teacherOrClass: 'Cô Lan', room: 'P.302', colorThemeIdx: 1 },

    '5-1': { periodNo: 1, subjectName: 'Mỹ thuật', subjectCode: 'MT', teacherOrClass: 'Cô Phương', room: 'P.302', colorThemeIdx: 0 },
    '5-2': { periodNo: 2, subjectName: 'Âm nhạc', subjectCode: 'AN', teacherOrClass: 'Thầy Đức', room: 'P.Music', colorThemeIdx: 1 },
    '5-3': { periodNo: 3, subjectName: 'Sinh hoạt', subjectCode: 'SH', teacherOrClass: 'Cô Hoa', room: 'P.302', colorThemeIdx: 2 },
  }
}

function getTeacherMockSchedule(): Record<string, TimetableSlot> {
  return {
    '0-2': { periodNo: 2, subjectName: 'Toán 6A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 6A1', room: 'P.302', colorThemeIdx: 0 },
    '0-3': { periodNo: 3, subjectName: 'Toán 6A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 6A1', room: 'P.302', colorThemeIdx: 0 },
    '1-1': { periodNo: 1, subjectName: 'Toán 7A2', subjectCode: 'TOAN', teacherOrClass: 'Lớp 7A2', room: 'P.201', colorThemeIdx: 1 },
    '1-2': { periodNo: 2, subjectName: 'Toán 7A2', subjectCode: 'TOAN', teacherOrClass: 'Lớp 7A2', room: 'P.201', colorThemeIdx: 1 },
    '2-3': { periodNo: 3, subjectName: 'Toán 6A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 6A1', room: 'P.302', colorThemeIdx: 0 },
    '3-1': { periodNo: 1, subjectName: 'Toán 8A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 8A1', room: 'P.102', colorThemeIdx: 2 },
    '3-2': { periodNo: 2, subjectName: 'Toán 8A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 8A1', room: 'P.102', colorThemeIdx: 2 },
    '4-1': { periodNo: 1, subjectName: 'Toán 6A1', subjectCode: 'TOAN', teacherOrClass: 'Lớp 6A1', room: 'P.302', colorThemeIdx: 0 },
    '4-4': { periodNo: 4, subjectName: 'Toán 9A3', subjectCode: 'TOAN', teacherOrClass: 'Lớp 9A3', room: 'P.405', colorThemeIdx: 3 },
    '4-5': { periodNo: 5, subjectName: 'Toán 9A3', subjectCode: 'TOAN', teacherOrClass: 'Lớp 9A3', room: 'P.405', colorThemeIdx: 3 },
  }
}

// ──────────────────────────────────────────────────────
// Reusable Dynamic Equal Timetable Grid Component
// ──────────────────────────────────────────────────────

function DynamicEqualTimetableGrid({
  schedule,
  selectedDateStr,
  onSelectDate,
}: {
  schedule: Record<string, TimetableSlot>
  selectedDateStr: string
  onSelectDate: (isoDate: string) => void
}) {
  const weekDays = getWeekDays(selectedDateStr)

  function getConsecutiveStreakInfo(
    dayIdx: number,
    periodNo: number,
    sessionSlots: { period: number }[]
  ) {
    const current = schedule[`${dayIdx}-${periodNo}`]
    if (!current || !current.subjectName) {
      return { isStart: true, streakLength: 1, isChild: false }
    }

    const sessionStartPeriod = sessionSlots[0].period
    const sessionEndPeriod = sessionSlots[sessionSlots.length - 1].period

    const prevEntry = periodNo > sessionStartPeriod ? schedule[`${dayIdx}-${periodNo - 1}`] : null

    if (prevEntry && prevEntry.subjectName === current.subjectName) {
      return { isStart: false, streakLength: 1, isChild: true }
    }

    let streakLength = 1
    for (let p = periodNo + 1; p <= sessionEndPeriod; p++) {
      const nextEntry = schedule[`${dayIdx}-${p}`]
      if (nextEntry && nextEntry.subjectName === current.subjectName) {
        streakLength++
      } else {
        break
      }
    }

    return { isStart: true, streakLength, isChild: false }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <div className="min-w-[960px]">
        {/* Dynamic Header Row */}
        <div className="grid grid-cols-[140px_repeat(6,1fr)] bg-gray-100/80 border-b border-gray-200 text-[#111c2d]">
          <div className="p-3 border-r border-gray-200 text-[11px] font-bold text-center uppercase tracking-widest text-gray-500 flex items-center justify-center">
            TIẾT / GIỜ
          </div>
          {weekDays.map((d) => (
            <div
              key={d.isoDate}
              onClick={() => onSelectDate(d.isoDate)}
              className={`p-3 border-r last:border-r-0 border-gray-200 text-center cursor-pointer transition-colors ${
                d.isCurrentSelected
                  ? 'bg-[#003366] text-white shadow-md'
                  : 'hover:bg-gray-200/60'
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

        {/* Timetable Body */}
        <div className="flex flex-col divide-y divide-gray-200">
          {/* BUỔI SÁNG */}
          <div className="bg-blue-50/40 px-4 py-2 font-bold text-xs text-[#003366] flex items-center gap-2 border-b border-gray-200">
            <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
            <span className="tracking-wider">BUỔI SÁNG</span>
          </div>

          {MORNING_PERIODS.map((slot) => (
            <div
              key={'m-slot-' + slot.period}
              className="grid grid-cols-[140px_repeat(6,1fr)] divide-x divide-gray-200 min-h-[88px]"
            >
              <div className="p-3 bg-gray-50 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold text-[#001d36]">Tiết {slot.period}</span>
                <span className="text-[11px] font-medium text-gray-500 mt-0.5">{slot.range}</span>
              </div>

              {weekDays.map((d) => {
                const cellData = schedule[`${d.dayIdx}-${slot.period}`]
                const theme = cellData ? getTheme(cellData.colorThemeIdx) : null

                const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, MORNING_PERIODS)

                if (streak.isChild) {
                  return (
                    <div key={`m-cell-${d.dayIdx}-${slot.period}`} className="p-1.5 h-[88px] opacity-0 pointer-events-none" />
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
                    key={`m-cell-${d.dayIdx}-${slot.period}`}
                    className={`p-1.5 flex flex-col transition-all ${
                      d.isCurrentSelected ? 'bg-blue-50/50 ring-1 ring-[#003366]/30' : ''
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
                    {cellData ? (
                      <div
                        className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <span className={`${titleFontSize} leading-tight block`}>{cellData.subjectName}</span>
                            {isMulti && (
                              <span className="text-[10px] font-bold opacity-90 block mt-1 bg-white/20 px-2 py-0.5 rounded-full w-fit">
                                Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                            {cellData.subjectCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                          <span className="truncate">{cellData.teacherOrClass}</span>
                          <span className="font-semibold">{cellData.room}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
                        <span className="text-[11px] font-medium opacity-60">Trống</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* BUỔI CHIỀU */}
          <div className="bg-amber-50/40 px-4 py-2 font-bold text-xs text-amber-900 flex items-center gap-2 border-y border-gray-200">
            <span className="material-symbols-outlined text-[18px]">bedtime</span>
            <span className="tracking-wider">BUỔI CHIỀU</span>
          </div>

          {AFTERNOON_PERIODS.map((slot) => (
            <div
              key={'a-slot-' + slot.period}
              className="grid grid-cols-[140px_repeat(6,1fr)] divide-x divide-gray-200 min-h-[88px]"
            >
              <div className="p-3 bg-gray-50 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-bold text-[#001d36]">Tiết {slot.period}</span>
                <span className="text-[11px] font-medium text-gray-500 mt-0.5">{slot.range}</span>
              </div>

              {weekDays.map((d) => {
                const cellData = schedule[`${d.dayIdx}-${slot.period}`]
                const theme = cellData ? getTheme(cellData.colorThemeIdx) : null

                const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, AFTERNOON_PERIODS)

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
                    className={`p-1.5 flex flex-col transition-all ${
                      d.isCurrentSelected ? 'bg-amber-50/40 ring-1 ring-amber-500/30' : ''
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
                    {cellData ? (
                      <div
                        className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md transition-all`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <span className={`${titleFontSize} leading-tight block`}>{cellData.subjectName}</span>
                            {isMulti && (
                              <span className="text-[10px] font-bold opacity-90 block mt-1 bg-white/20 px-2 py-0.5 rounded-full w-fit">
                                Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                            {cellData.subjectCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                          <span className="truncate">{cellData.teacherOrClass}</span>
                          <span className="font-semibold">{cellData.room}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
                        <span className="text-[11px] font-medium opacity-60">Trống</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Helpers to convert raw DB timetable entries → schedule map
// ──────────────────────────────────────────────────────

function buildScheduleFromEntries(
  entries: any[],
  labelField: 'teacher' | 'class'
): Record<string, TimetableSlot> {
  const map: Record<string, TimetableSlot> = {}
  entries.forEach((e, i) => {
    const dayStr = e.day_of_week ?? e.dayOfWeek ?? '2'
    const dayIdx = Math.max(0, Number(dayStr) - 2)
    const period = Number(e.period_no ?? e.periodNo ?? 1)
    const key = `${dayIdx}-${period}`
    const subj = e.subjects ?? e.subject ?? {}
    const subjectName = subj.subject_name ?? e.subject_name ?? 'Môn học'
    const subjectCode = subj.subject_code ?? e.subject_code ?? 'MON'
    const teacher = e.teachers ?? e.teacher ?? {}
    const cls = e.classes ?? e.class ?? {}
    const teacherOrClass =
      labelField === 'teacher'
        ? cls.class_name ?? `Lớp ${e.class_id ?? ''}` 
        : teacher.full_name ?? `GV ${e.teacher_id ?? ''}`
    map[key] = {
      periodNo: period,
      subjectName,
      subjectCode,
      teacherOrClass,
      room: e.room ?? 'P.--',
      colorThemeIdx: i,
    }
  })
  return map
}

// ──────────────────────────────────────────────────────
// Teacher View
// ──────────────────────────────────────────────────────

function TeacherTimetablePage({ userName }: { userName: string }) {
  const [schedule, setSchedule] = useState<Record<string, TimetableSlot>>({})
  const [loadingData, setLoadingData] = useState(true)
  const [totalPeriods, setTotalPeriods] = useState(0)
  const [classCount, setClassCount] = useState(0)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    setLoadingData(true)
    getMyTimetable().then(res => {
      const entries = res.data ?? []
      setSchedule(buildScheduleFromEntries(entries, 'teacher'))
      setTotalPeriods(entries.length)
      const uniqueClasses = new Set(entries.map((e: any) => e.class_id).filter(Boolean))
      setClassCount(uniqueClasses.size)
    }).catch(console.error).finally(() => setLoadingData(false))
  }, [])

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

  if (loadingData) {
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
      <DynamicEqualTimetableGrid
        schedule={schedule}
        selectedDateStr={selectedDateStr}
        onSelectDate={setSelectedDateStr}
      />
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Student View
// ──────────────────────────────────────────────────────

function StudentTimetablePage({ userName }: { userName: string }) {
  const [schedule, setSchedule] = useState<Record<string, TimetableSlot>>({})
  const [loadingData, setLoadingData] = useState(true)
  const [className, setClassName] = useState<string | null>(null)
  const [subjectCount, setSubjectCount] = useState(0)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    setLoadingData(true)
    getMyTimetable().then(res => {
      const entries = res.data ?? []
      setSchedule(buildScheduleFromEntries(entries, 'class'))
      setClassName(res.className ?? null)
      const uniqueSubjects = new Set(entries.map((e: any) => e.subject_id).filter(Boolean))
      setSubjectCount(uniqueSubjects.size)
    }).catch(console.error).finally(() => setLoadingData(false))
  }, [])

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

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003366] border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-gray-600">Đang tải thời khóa biểu...</p>
      </div>
    )
  }

  const totalPeriods = Object.keys(schedule).length
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
            <span className="text-2xl font-extrabold text-[#001d36] block mt-1">Phòng 302</span>
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

      {/* Grid View */}
      <DynamicEqualTimetableGrid
        schedule={schedule}
        selectedDateStr={selectedDateStr}
        onSelectDate={setSelectedDateStr}
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
