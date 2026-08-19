'use client'

// ──────────────────────────────────────────────────────
// Admin-style read-only timetable grid
// Renders timetable entries exactly like the admin page:
// subject name + code tag, "GV: teacher" + room, subject-based
// colour themes, and merging of consecutive same-subject periods.
// ──────────────────────────────────────────────────────

export interface AdminGridEntry {
  schedule_id?: number
  class_id?: number
  class_name?: string
  classes?: any
  subject_id?: number
  day_of_week?: string | number
  period_no?: number
  room?: string
  subject_name?: string
  subject_code?: string
  custom_subject_name?: string
  custom_teacher_name?: string
  teacher_name?: string
  subjects?: any
  teachers?: any
  timetable_type_id?: number
}

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

function serverDayToFront(dayStr: string | number): number {
  const num = Number(dayStr)
  if (isNaN(num)) return 0
  return num - 2
}

const CARD_THEMES = [
  { bg: 'bg-white text-[#001d36] border-[#003366] border-l-[3px]', tag: 'bg-[#003366]/10 text-[#003366]' },
  { bg: 'bg-white text-[#001d36] border-[#0055a5] border-l-[3px]', tag: 'bg-blue-100 text-[#0055a5]' },
  { bg: 'bg-white text-[#001d36] border-[#1976d2] border-l-[3px]', tag: 'bg-blue-50 text-[#1976d2]' },
  { bg: 'bg-white text-[#001d36] border-[#0288d1] border-l-[3px]', tag: 'bg-sky-50 text-[#0288d1]' },
  { bg: 'bg-white text-[#001d36] border-[#00796b] border-l-[3px]', tag: 'bg-teal-50 text-[#00796b]' },
  { bg: 'bg-white text-[#001d36] border-[#5e35b1] border-l-[3px]', tag: 'bg-purple-50 text-[#5e35b1]' },
]

function getSubjectTheme(id: number) {
  return CARD_THEMES[Math.abs(id) % CARD_THEMES.length]
}

function getSubjectGroupKey(entry: AdminGridEntry | undefined): string | null {
  if (!entry) return null
  // Group by class AND subject so different classes are never merged together
  // (a teacher may teach the same subject in consecutive periods across classes).
  const classKey = entry.class_id ?? (Array.isArray(entry.classes) ? entry.classes[0]?.class_id : entry.classes?.class_id) ?? ''
  if (entry.custom_subject_name) return `c:${classKey}|custom:${entry.custom_subject_name}`
  return `c:${classKey}|id:${getSubjectForEntry(entry)?.subject_id ?? ''}`
}

function getClassNameForEntry(entry: AdminGridEntry | undefined): string {
  if (!entry) return ''
  if (entry.class_name) return entry.class_name
  const cls: any = Array.isArray(entry.classes) ? entry.classes[0] : entry.classes
  return cls?.class_name ?? ''
}

function getSubjectForEntry(entry: AdminGridEntry | undefined) {
  if (!entry) return undefined
  if (entry.custom_subject_name) {
    return {
      subject_id: entry.subject_id ?? 0,
      subject_code: 'T',
      subject_name: entry.custom_subject_name,
    }
  }
  const rawSub: any = entry.subjects
  if (rawSub) {
    if (Array.isArray(rawSub) && rawSub.length > 0) {
      const s = rawSub[0]
      return { subject_id: s.subject_id ?? entry.subject_id, subject_code: s.subject_code, subject_name: s.subject_name }
    }
    if (typeof rawSub === 'object' && rawSub.subject_name) {
      return { subject_id: rawSub.subject_id ?? entry.subject_id, subject_code: rawSub.subject_code, subject_name: rawSub.subject_name }
    }
  }
  if (entry.subject_name) {
    return { subject_id: entry.subject_id ?? 0, subject_code: entry.subject_code || 'MON', subject_name: entry.subject_name }
  }
  return undefined
}

export default function AdminStyleTimetableGrid({
  entries,
  selectedDateStr,
  onSelectDate,
}: {
  entries: AdminGridEntry[]
  selectedDateStr: string
  onSelectDate?: (isoDate: string) => void
}) {
  const weekDays = getWeekDays(selectedDateStr)

  function getEntry(dayIdx: number, periodNo: number): AdminGridEntry | undefined {
    return entries.find((e) => {
      const d = serverDayToFront(e.day_of_week ?? '')
      const p = Number(e.period_no ?? 1)
      return d === dayIdx && p === periodNo
    })
  }

  function getConsecutiveStreakInfo(dayIdx: number, periodNo: number, sessionSlots: { period: number }[]) {
    const current = getEntry(dayIdx, periodNo)
    const currentSubj = getSubjectGroupKey(current)

    if (currentSubj == null) {
      return { isStart: true, streakLength: 1, isChild: false }
    }

    const sessionStartPeriod = sessionSlots[0].period
    const sessionEndPeriod = sessionSlots[sessionSlots.length - 1].period

    const prevEntry = periodNo > sessionStartPeriod ? getEntry(dayIdx, periodNo - 1) : undefined
    const prevSubj = getSubjectGroupKey(prevEntry)

    if (prevSubj === currentSubj) {
      return { isStart: false, streakLength: 1, isChild: true }
    }

    let streakLength = 1
    for (let p = periodNo + 1; p <= sessionEndPeriod; p++) {
      const nextEntry = getEntry(dayIdx, p)
      if (getSubjectGroupKey(nextEntry) === currentSubj) {
        streakLength++
      } else {
        break
      }
    }

    return { isStart: true, streakLength, isChild: false }
  }

  function renderSlots(slots: typeof MORNING_SLOTS, prefix: string, dayHighlightClass: string) {
    return slots.map((slot) => (
      <div key={`${prefix}-slot-${slot.period}`} className="grid grid-cols-[140px_repeat(6,1fr)] divide-x divide-gray-200 min-h-[88px]">
        <div className="p-3 bg-gray-50 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-bold text-[#001d36]">Tiết {slot.period}</span>
          <span className="text-[11px] font-medium text-gray-500 mt-0.5">{slot.range}</span>
        </div>

        {weekDays.map((d) => {
          const entry = getEntry(d.dayIdx, slot.period)
          const subject = getSubjectForEntry(entry)
          const theme = subject ? getSubjectTheme(subject.subject_id) : null
          const isExam = Number((entry as any)?.timetable_type_id) === 2
          const teacherName =
            (entry as any)?.custom_teacher_name ||
            (entry as any)?.teachers?.full_name ||
            (entry as any)?.teacher_name ||
            (Array.isArray((entry as any)?.teachers) ? (entry as any)?.teachers[0]?.full_name : null) ||
            'Chưa phân công'

          const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, slots)

          if (streak.isChild) {
            return <div key={`${prefix}-cell-${d.dayIdx}-${slot.period}`} className="p-1.5 h-[88px] opacity-0 pointer-events-none" />
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
              key={`${prefix}-cell-${d.dayIdx}-${slot.period}`}
              className={`p-1.5 flex flex-col transition-all ${d.isCurrentSelected ? dayHighlightClass : ''}`}
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
                <div className={`h-full w-full rounded-lg border p-2.5 flex flex-col justify-between overflow-hidden shadow-sm ${isExam ? 'border-purple-400 bg-purple-50 text-purple-900' : `${theme?.bg}`}`}>
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      {isExam && (
                        <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide w-fit mb-1">Thi</span>
                      )}
                      <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                      {getClassNameForEntry(entry) && (
                        <span className="text-[10px] font-bold block mt-0.5 text-[#001d36]">Lớp {getClassNameForEntry(entry)}</span>
                      )}
                      {isMulti && !isExam && (
                        <span className="text-[10px] font-bold block mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                          Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${isExam ? 'bg-purple-200 text-purple-800' : `${theme?.tag}`}`}>
                      {isExam ? 'THI' : (subject.subject_code || 'MON')}
                    </span>
                  </div>
                  <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                    <span className="truncate">{isExam ? ((entry as any)?.is_proctor_duty ? 'Coi thi' : 'Lịch thi') : `GV: ${teacherName}`}</span>
                    <span className="font-semibold">{entry?.room || ''}</span>
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
    ))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <div className="min-w-[960px]">
        {/* Header */}
        <div className="grid grid-cols-[140px_repeat(6,1fr)] bg-gray-100/80 border-b border-gray-200 text-[#111c2d]">
          <div className="p-3 border-r border-gray-200 text-[11px] font-bold text-center uppercase tracking-widest text-gray-500 flex items-center justify-center">
            TIẾT / GIỜ
          </div>
          {weekDays.map((d) => (
            <div
              key={d.isoDate}
              onClick={() => onSelectDate?.(d.isoDate)}
              className={`p-3 border-r last:border-r-0 border-gray-200 text-center cursor-pointer transition-colors ${d.isCurrentSelected ? 'bg-[#003366] text-white shadow-md' : 'hover:bg-gray-200/60'
                }`}
            >
              <div className={`text-sm font-bold ${d.isCurrentSelected ? 'text-white' : 'text-[#001d36]'}`}>{d.label}</div>
              <div className={`text-[11px] font-semibold mt-0.5 ${d.isCurrentSelected ? 'text-blue-100' : 'text-gray-500'}`}>{d.dateStr}</div>
              {d.isCurrentSelected && (
                <span className="mt-1 inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-white text-[#003366] rounded-full">
                  Đang xem
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex flex-col divide-y divide-gray-200">
          <div className="bg-blue-50/40 px-4 py-2 font-bold text-xs text-[#003366] flex items-center gap-2 border-b border-gray-200">
            <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
            <span className="tracking-wider">BUỔI SÁNG</span>
          </div>
          {renderSlots(MORNING_SLOTS, 'm', 'bg-blue-50/50 ring-1 ring-[#003366]/30')}

          <div className="bg-amber-50/40 px-4 py-2 font-bold text-xs text-amber-900 flex items-center gap-2 border-y border-gray-200">
            <span className="material-symbols-outlined text-[18px]">bedtime</span>
            <span className="tracking-wider">BUỔI CHIỀU</span>
          </div>
          {renderSlots(AFTERNOON_SLOTS, 'a', 'bg-amber-50/40 ring-1 ring-amber-500/30')}
        </div>
      </div>
    </div>
  )
}
