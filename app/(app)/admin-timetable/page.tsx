'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getClasses, getSubjects, getTimetables, createTimetable, deleteTimetable, getTeachers, getSemesters, getScheduleRules, saveScheduleRules, getRooms, createRoom, updateRoom, deleteRoom, getClassRooms, saveClassRooms, setClassFixedRoom, autoScheduleTimetables, createExamSchedule, getGradeExams, deleteExamSchedule, clearGradeTimetable, reassignExamProctors, type ScheduleRule, type Room } from '@/lib/api'
import { useAcademic } from '@/lib/academic-context'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'

const normText = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')

function specialRoomForSubject(subjectName: string, subjectCode: string, allRoomsRef: Room[]): string | null {
  const n = normText(`${subjectName} ${subjectCode}`)
  if (n.includes('the duc') || n.includes('chao co') || n.includes('theduc') || n.includes('chaoco')) {
    return allRoomsRef.find((r) => normText(`${r.room_name} ${r.room_type || ''}`).includes('san'))?.room_name ?? null
  }
  if (n.includes('tin hoc') || n.includes('tin')) {
    return allRoomsRef.find((r) => /lab|it|may/.test(normText(`${r.room_name} ${r.room_type || ''}`)))?.room_name ?? null
  }
  return null
}

// All Mondays (week starts) between two ISO date strings (inclusive).

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
  custom_subject_name?: string
  custom_teacher_name?: string
  teacher_name?: string
  teachers?: any
  timetable_type_id?: number
  exam_name?: string
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

function serverDayToFront(dayStr: string): number {
  const num = Number(dayStr)
  if (isNaN(num)) return 0
  return num - 2
}

function frontDayToServer(dayIdx: number): string {
  return String(dayIdx + 2)
}

const CARD_THEMES = [
  { bg: 'bg-white text-[#001d36] border-[#003366] border-l-[3px]', tag: 'bg-[#003366]/10 text-[#003366]', accent: '#003366' },
  { bg: 'bg-white text-[#001d36] border-[#0055a5] border-l-[3px]', tag: 'bg-blue-100 text-[#0055a5]', accent: '#0055a5' },
  { bg: 'bg-white text-[#001d36] border-[#1976d2] border-l-[3px]', tag: 'bg-blue-50 text-[#1976d2]', accent: '#1976d2' },
  { bg: 'bg-white text-[#001d36] border-[#0288d1] border-l-[3px]', tag: 'bg-sky-50 text-[#0288d1]', accent: '#0288d1' },
  { bg: 'bg-white text-[#001d36] border-[#00796b] border-l-[3px]', tag: 'bg-teal-50 text-[#00796b]', accent: '#00796b' },
  { bg: 'bg-white text-[#001d36] border-[#5e35b1] border-l-[3px]', tag: 'bg-purple-50 text-[#5e35b1]', accent: '#5e35b1' },
]

function getSubjectTheme(id: number) {
  return CARD_THEMES[id % CARD_THEMES.length]
}

// ──────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────

export default function AdminTimetablePage() {
  const { selectedSemesterId, setSelectedSemesterId, selectedSchoolYearId, currentSchoolYear } = useAcademic()
  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? null
  const [mounted, setMounted] = useState<boolean>(false)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<DbSubject[]>(DEFAULT_SUBJECTS)
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('Khối 6')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(1)
  const [selectedRoom, setSelectedRoom] = useState<string>('Tất cả phòng')

  // Room management (Phòng học)
  const [classRooms, setClassRooms] = useState<Room[]>([])
  const [fixedRoomId, setFixedRoomId] = useState<number | null>(null)
  const [roomsModalOpen, setRoomsModalOpen] = useState<boolean>(false)
  const [allRooms, setAllRooms] = useState<Room[]>([])
  const [assignedRoomIds, setAssignedRoomIds] = useState<number[]>([])
  const [savingRooms, setSavingRooms] = useState<boolean>(false)
  const [roomForm, setRoomForm] = useState<{ room_id?: number; room_name: string; room_type: string }>({ room_name: '', room_type: '' })
  const [roomOwnerMap, setRoomOwnerMap] = useState<Record<number, string[]>>({})
  const [fixedRoomNameState, setFixedRoomNameState] = useState<string | null>(null)
  const [semesters, setSemesters] = useState<any[]>([])

  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [loading, setLoading] = useState<boolean>(true)
  const timetableReqSeq = useRef(0)
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const lastExamMode = useRef(false)

  // Cell Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [activeCell, setActiveCell] = useState<{ dayIdx: number; periodNo: number } | null>(null)
  const [activeEntry, setActiveEntry] = useState<TimetableEntry | null>(null)

  // Quick Schedule Form Modal (Header Button)
  const [quickModalOpen, setQuickModalOpen] = useState<boolean>(false)
  const [quickDayIdx, setQuickDayIdx] = useState<number>(0)
  const [quickPeriodNo, setQuickPeriodNo] = useState<number>(1)
  const [quickSubjectId, setQuickSubjectId] = useState<number>(1)

  // Auto Schedule Modal State
  const [autoModalOpen, setAutoModalOpen] = useState<boolean>(false)
  const [autoScope, setAutoScope] = useState<'all' | 'selectedGrade'>('all')
  const [autoSemesterId, setAutoSemesterId] = useState<number | null>(null)
  const [autoAllSemesters, setAutoAllSemesters] = useState<boolean>(false)
  const [khtnPriority, setKhtnPriority] = useState<string[]>(['Hóa'])
  const [autoScheduling, setAutoScheduling] = useState<boolean>(false)

  // Confirm modal for "Xóa TKB toàn khối"
  const [confirmClearGrade, setConfirmClearGrade] = useState<boolean>(false)
  const [clearingGrade, setClearingGrade] = useState<boolean>(false)
  const [clearScope, setClearScope] = useState<'hk1' | 'hk2' | 'week'>('week')

  const yearSemesters = semesters.filter((s: any) => !effectiveYearId || Number(s.school_year_id) === Number(effectiveYearId))
  const orderedSems = [...yearSemesters].sort((a: any, b: any) => Number(a.term_order ?? a.semester_id) - Number(b.term_order ?? b.semester_id))
  const hk1Id = orderedSems[0]?.semester_id ?? null
  const hk2Id = orderedSems[1]?.semester_id ?? null
  const [autoResult, setAutoResult] = useState<{
    totalClasses: number
    totalEntries: number
    totalWeeks?: number
    teacherStats: Array<{ teacher_name: string; classCount: number }>
  } | null>(null)

  // Lịch thi (exam schedule) state
  const [examMode, setExamMode] = useState<boolean>(false)
  const [examForm, setExamForm] = useState<{
    gradeLevel: number
    subjectId: number
    examDate: string
    session: 'morning' | 'afternoon' | 'both'
    dayOfWeek: string
    periods: number[]
    examName: string
    proctorsPerRoom: number
  }>({ gradeLevel: 6, subjectId: 1, examDate: new Date().toISOString().split('T')[0], session: 'morning', dayOfWeek: '2', periods: [1], examName: '', proctorsPerRoom: 1 })
  const [examList, setExamList] = useState<{ schedules: any[]; assignments: any[]; proctors: any[]; makeup: any[] }>({ schedules: [], assignments: [], proctors: [], makeup: [] })
  const [savingExam, setSavingExam] = useState<boolean>(false)

  // Schedule rules (configurable constraints for the auto-scheduler), keyed by subject_id
  const [scheduleRules, setScheduleRules] = useState<Record<number, ScheduleRule>>({})
  const [savingRules, setSavingRules] = useState<boolean>(false)

  // Morning-only week profile: how many days run 3 periods and how many run 4
  // (persisted in localStorage so it survives a refresh).
  const [days3, setDays3] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem('tkb_days3'))
      return Number.isFinite(v) && v > 0 ? v : 0
    } catch {
      return 0
    }
  })
  const [days4, setDays4] = useState<number>(() => {
    try {
      const v = Number(localStorage.getItem('tkb_days4'))
      return Number.isFinite(v) && v > 0 ? v : 0
    } catch {
      return 0
    }
  })
  const [rulesLoaded, setRulesLoaded] = useState<boolean>(false)
  const [teachersList, setTeachersList] = useState<any[]>([])

  // In-app toast (replaces native alert() for save feedback)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  // Classes filtered by selected grade (for scope selector display in auto schedule modal)
  const gradeNum = Number(selectedGrade.replace(/\D/g, '')) || 6
  const gradeFilteredClasses = classes.filter((c: any) =>
    c.grade_level === gradeNum || c.class_name?.startsWith(String(gradeNum))
  )

  // Teacher selection picker state
  const [showTeacherPicker, setShowTeacherPicker] = useState<boolean>(false)
  const [qualifiedTeachers, setQualifiedTeachers] = useState<any[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState<boolean>(false)

  // Custom subject state (for "Môn tự đăng ký" in picker)
  const [customSubjectName, setCustomSubjectName] = useState<string>('')
  const [customTeacherName, setCustomTeacherName] = useState<string>('')
  const [customRoom, setCustomRoom] = useState<string>('Tất cả phòng')

  async function handleAssignTeacherToEntry(teacherId: number, teacherName: string) {
    if (!activeEntry || !activeCell) return
    setSaving(true)
    try {
      const dayIdx = activeCell.dayIdx
      const periodNo = activeCell.periodNo
      const targetClassId = selectedClassId || activeEntry.class_id || 1
      const subjId = activeEntry.subject_id ?? activeEntry.subjects?.subject_id

      // Determine the full block of consecutive periods that share the same
      // subject in this class on this day, so the teacher is assigned to every
      // period of a double (2, 3...) consecutive block, not just the clicked one.
      const entrySubj = (e: any) => e?.subject_id ?? e?.subjects?.subject_id
      let blockStart = periodNo
      while (blockStart - 1 >= 1 && entrySubj(getEntry(dayIdx, blockStart - 1)) === subjId) {
        blockStart--
      }
      let blockEnd = periodNo
      while (entrySubj(getEntry(dayIdx, blockEnd + 1)) === subjId) {
        blockEnd++
      }

      for (let p = blockStart; p <= blockEnd; p++) {
        const result = await createTimetable({
          classId: targetClassId,
          subjectId: subjId,
          teacherId,
        semesterId: autoSemesterId ?? selectedSemesterId ?? 1,
          dayOfWeek: frontDayToServer(dayIdx),
          periodNo: p,
          weekStart: selectedDateStr,
          room: roomForSubject(activeEntry?.subjects as DbSubject) || undefined,
          custom_subject_name: activeEntry.custom_subject_name || undefined,
        })

        if (!result.success) {
          showToast('Lỗi khi gán giáo viên: ' + (result.error || 'Lỗi cơ sở dữ liệu'), 'error')
          return
        }
      }

      setEntries((prev) =>
        prev.map((e) =>
          e.schedule_id === activeEntry.schedule_id ||
          (serverDayToFront(e.day_of_week) === dayIdx && (e.period_no ?? 0) >= blockStart && (e.period_no ?? 0) <= blockEnd)
            ? { ...e, teacher_id: teacherId, teachers: { teacher_id: teacherId, full_name: teacherName }, teacher_name: teacherName }
            : e
        )
      )
      setShowTeacherPicker(false)
      setModalOpen(false)
    } catch (err) {
      console.error('Assign teacher error:', err)
      showToast('Đã xảy ra lỗi khi gán giáo viên.', 'error')
    } finally {
      setSaving(false)
    }
  }

  function setRuleField(subjectId: number, field: keyof ScheduleRule, value: ScheduleRule[keyof ScheduleRule]) {
    setScheduleRules((prev) => {
      const current = prev[subjectId] ?? { subject_id: subjectId, periods_per_week: 0, session: 'any' as const, double_period: 1, teacher_id: null, enabled: true }
      return { ...prev, [subjectId]: { ...current, [field]: value } }
    })
  }

  async function handleSaveRules() {
    setSavingRules(true)
    try {
      const rules = Object.values(scheduleRules).map((r) => ({
        subject_id: r.subject_id,
        periods_per_week: Math.max(0, Number(r.periods_per_week) || 0),
        session: (r.session || 'any') as ScheduleRule['session'],
        double_period: [1, 2, 3].includes(r.double_period) ? r.double_period : 1,
        teacher_id: r.teacher_id ? Number(r.teacher_id) : null,
        enabled: r.enabled !== false,
      }))
      const res = await saveScheduleRules(rules)
      if (!res.success) {
        showToast('Lỗi khi lưu quy tắc: ' + (res.error || 'Lỗi cơ sở dữ liệu'), 'error')
        return
      }
      showToast('Đã lưu quy tắc xếp lịch!', 'success')
    } catch (err) {
      console.error('Save rules error:', err)
      showToast('Đã xảy ra lỗi khi lưu quy tắc.', 'error')
    } finally {
      setSavingRules(false)
    }
  }

  async function handleOpenRoomsModal() {
    setRoomsModalOpen(true)
    setRoomForm({ room_name: '', room_type: '' })
    try {
      const [rooms, classData, allClasses] = await Promise.all([
        getRooms(),
        selectedClassId ? getClassRooms(selectedClassId) : Promise.resolve(null),
        getClasses({ limit: 100 }).catch(() => null),
      ])
      setAllRooms(rooms)
      setAssignedRoomIds((classData?.rooms ?? []).map((r) => r.room_id))
      const owners: Record<number, string[]> = {}
      for (const c of (allClasses?.data ?? [])) {
        const fid = c?.fixed_room_id
        if (fid) {
          (owners[fid] = owners[fid] || []).push(c.class_name)
        }
      }
      setRoomOwnerMap(owners)
    } catch { /* ignore */ }
  }

  async function handleSaveRoomForm() {
    if (!roomForm.room_name.trim()) { showToast('Vui lòng nhập tên phòng', 'error'); return }
    const payload = { room_name: roomForm.room_name.trim(), room_type: roomForm.room_type.trim() || undefined }
    if (roomForm.room_id) {
      const res = await updateRoom(roomForm.room_id, payload)
      if (!res.success) { showToast('Lỗi khi cập nhật phòng', 'error'); return }
    } else {
      const res = await createRoom(payload)
      if (!res.success) { showToast('Lỗi khi tạo phòng', 'error'); return }
    }
    const rooms = await getRooms()
    setAllRooms(rooms)
    setRoomForm({ room_name: '', room_type: '' })
  }

  async function handleDeleteRoom(roomId: number) {
    const res = await deleteRoom(roomId)
    if (!res.success) { showToast('Lỗi khi xóa phòng', 'error'); return }
    setAllRooms((prev) => prev.filter((r) => r.room_id !== roomId))
    setAssignedRoomIds((prev) => prev.filter((id) => id !== roomId))
  }

  async function handleSaveClassRooms() {
    if (!selectedClassId) return
    setSavingRooms(true)
    try {
      const res = await saveClassRooms(selectedClassId, assignedRoomIds)
      if (!res.success) { showToast('Lỗi khi lưu phòng của lớp', 'error'); return }
      const fixedRes = await setClassFixedRoom(selectedClassId, fixedRoomId)
      if (!fixedRes.success) { showToast(fixedRes.error || 'Lỗi khi lưu phòng cố định', 'error'); return }
      const data = await getClassRooms(selectedClassId)
      setClassRooms(data.rooms ?? [])
      setFixedRoomId(data.fixed_room_id ?? null)
      setFixedRoomNameState(data.fixedRoom?.room_name ?? (data.rooms ?? []).find((r) => r.room_id === (data.fixed_room_id ?? null))?.room_name ?? null)
      setRoomsModalOpen(false)
      showToast('Đã lưu phòng học cho lớp!', 'success')
    } catch (err) {
      console.error(err)
      showToast('Đã xảy ra lỗi khi lưu phòng.', 'error')
    } finally {
      setSavingRooms(false)
    }
  }

  async function handleAutoScheduleAllClasses() {
    setAutoScheduling(true)
    setAutoResult(null)
    try {
      const gradeNum = Number(selectedGrade.replace(/\D/g, '')) || 6
      const yearSemesters = semesters.filter((s: any) => !effectiveYearId || Number(s.school_year_id) === Number(effectiveYearId))
      const semesterIds = autoAllSemesters
        ? yearSemesters.map((s: any) => Number(s.semester_id))
        : undefined
      const result = await autoScheduleTimetables({
        scope: autoScope,
        gradeLevel: autoScope === 'selectedGrade' ? gradeNum : undefined,
        semesterId: autoSemesterId ?? selectedSemesterId ?? 1,
        semesterIds,
        daysOf3Periods: days3,
        daysOf4Periods: days4,
        khtnPriority,
      })

      if (!result.success) {
        showToast('Lỗi khi xếp thời khóa biểu: ' + (result.error || 'Lỗi cơ sở dữ liệu'), 'error')
        setAutoScheduling(false)
        return
      }

      const data = result.data
      setAutoResult({
        totalClasses: data?.totalClasses ?? 0,
        totalEntries: data?.totalEntries ?? 0,
        totalWeeks: data?.weekStarts?.length ?? 0,
        teacherStats: (data?.teacherStats ?? []).map((s) => ({
          teacher_name: s.teacher_name,
          classCount: s.class_count,
          subject: s.subject,
        })),
      })

      const warnings = data?.warnings ?? []
      if (warnings.length > 0) {
        showToast('Xếp xong. Có ' + warnings.length + ' cảnh báo: ' + warnings[0], 'error')
      } else {
        showToast('Đã xếp thời khóa biểu xong!', 'success')
      }

      // Reload timetable for current class; keep the viewed semester/date in sync
      // with what was just scheduled so the grid isn't empty afterwards.
      const targetClassId = selectedClassId || (classes.length > 0 ? classes[0].class_id : null)
      if (targetClassId) {
        if (!autoAllSemesters) {
          const schedSem = autoSemesterId ?? selectedSemesterId
          if (schedSem) setSelectedSemesterId(Number(schedSem))
          const chosen = semesters.find((s: any) => Number(s.semester_id) === Number(schedSem))
          if (chosen?.start_date) setSelectedDateStr(firstMondayAtOrAfter(chosen.start_date))
        }
        const res = await getTimetables({
          classId: targetClassId,
          semesterId: !autoAllSemesters ? (autoSemesterId ?? selectedSemesterId ?? undefined) : undefined,
          weekStart: selectedDateStr,
          limit: 100,
        })
        if (res?.data) setEntries(res.data)
      }
    } catch (err) {
      console.error('Auto schedule error:', err)
      showToast('Đã xảy ra lỗi khi tự động sắp xếp thời khóa biểu.', 'error')
    } finally {
      setAutoScheduling(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('tkb_days3', String(days3 || 0))
    } catch {
      /* ignore */
    }
  }, [days3])
  useEffect(() => {
    try {
      localStorage.setItem('tkb_days4', String(days4 || 0))
    } catch {
      /* ignore */
    }
  }, [days4])

  // 1. Initial Fetching — run only once the current academic year is known (so
  // classes are fetched for the current year, not all years).
  useEffect(() => {
    if (effectiveYearId == null) return
    async function initData() {
      setLoading(true)
      try {
        const [clsRes, subjRes, semRes] = await Promise.all([getClasses({ limit: 100, schoolYearId: effectiveYearId }), getSubjects(), getSemesters(effectiveYearId)])
        const clsList = clsRes.success ? (clsRes.data ?? []) : []
        setClasses(clsList)

        try {
          const tRes = await getTeachers({ limit: 100 })
          if (tRes?.data) setTeachersList(tRes.data)
        } catch { /* ignore */ }

        if (subjRes && subjRes.length > 0) {
          setSubjects(subjRes)
        } else {
          setSubjects(DEFAULT_SUBJECTS)
        }

        try {
          const rules = await getScheduleRules()
          const ruleMap: Record<number, ScheduleRule> = {}
          rules.forEach((r) => { ruleMap[r.subject_id] = r })
          setScheduleRules(ruleMap)
          setRulesLoaded(true)
        } catch {
          setRulesLoaded(true)
        }

        const semList = Array.isArray(semRes) ? semRes : []
        setSemesters(semList)
        // Default the displayed week to the selected semester's start so the
        // timetable actually has data (avoids showing an empty grid for today).
        const active = semList.find((s: any) => Number(s.semester_id) === Number(selectedSemesterId)) || semList.find((s: any) => s.is_active) || semList[0]
        if (active?.start_date) {
          setSelectedDateStr(firstMondayAtOrAfter(active.start_date))
        } else if (active?.end_date) {
          setSelectedDateStr(firstMondayAtOrAfter(active.end_date))
        }

        // Pick a class that actually belongs to the current year (avoid defaulting
        // to a stale class id from another school year).
        if (clsList.length > 0) {
          setSelectedClassId((prev) => {
            const stillValid = prev != null && clsList.some((c: any) => Number(c.class_id) === Number(prev))
            return stillValid ? prev : clsList[0].class_id
          })
        }
      } catch (err) {
        console.error('Failed to initialize data:', err)
        setSubjects(DEFAULT_SUBJECTS)
      } finally {
        setLoading(false)
      }
    }
    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveYearId])

  // Sync the viewed week to the newly selected semester's start so the grid
  // isn't left on a date from another semester (semester is chosen in Header).
  useEffect(() => {
    if (semesters.length === 0 || !selectedSemesterId) return
    const chosen = semesters.find((s: any) => Number(s.semester_id) === Number(selectedSemesterId))
    if (chosen?.start_date) setSelectedDateStr(firstMondayAtOrAfter(chosen.start_date))
    else if (chosen?.end_date) setSelectedDateStr(firstMondayAtOrAfter(chosen.end_date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSemesterId, semesters.length])

  // 2. Fetch Timetable Entries when Class or Semester changes
  useEffect(() => {
    if (!selectedClassId) return
    const seq = ++timetableReqSeq.current

    async function loadTimetable() {
      setLoadingGrid(true)
      try {
        const res = await getTimetables({ classId: selectedClassId ?? undefined, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
        if (seq !== timetableReqSeq.current) return
        const raw = res.data ?? []
        setEntries(raw)
      } catch (err) {
        if (seq !== timetableReqSeq.current) return
        console.error('Failed to load timetable:', err)
      } finally {
        if (seq === timetableReqSeq.current) setLoadingGrid(false)
      }
    }
    loadTimetable()
  }, [selectedClassId, selectedSemesterId, selectedDateStr])

  // Load this class's assignable rooms + fixed room whenever the class changes
  useEffect(() => {
    if (!selectedClassId) return
    const classId = selectedClassId
    async function loadRooms() {
      try {
        const data = await getClassRooms(classId)
        const rooms = data.rooms ?? []
        setClassRooms(rooms)
        setFixedRoomId(data.fixed_room_id ?? null)
        setFixedRoomNameState(data.fixedRoom?.room_name ?? rooms.find((r) => r.room_id === (data.fixed_room_id ?? null))?.room_name ?? null)
        getRooms().then((rs) => setAllRooms(rs)).catch(() => {})
        const fixedName = rooms.find((r) => r.room_id === (data.fixed_room_id ?? null))?.room_name
        setSelectedRoom(fixedName ?? 'Tất cả phòng')
        if (rooms.length === 1) setSelectedRoom(rooms[0].room_name)
      } catch { /* ignore */ }
    }
    loadRooms()
  }, [selectedClassId])

  // 3. Auto-select first class in grade when grade changes
  useEffect(() => {
    if (classes.length === 0) return
    const gradeN = Number(selectedGrade.replace(/\D/g, '')) || 6
    const gradeClasses = classes.filter((c: any) =>
      c.grade_level === gradeN || c.class_name?.startsWith(String(gradeN))
    )
    if (gradeClasses.length > 0) {
      setSelectedClassId(gradeClasses[0].class_id)
    }
  }, [selectedGrade, classes])

  const weekDays = getWeekDays(selectedDateStr)


  // When the picked date falls inside a different semester of the same school
  // year, switch to that semester automatically (instead of hiding its periods).
  function selectDateAndSyncSemester(dateStr: string) {
    setSelectedDateStr(dateStr)
    if (!effectiveYearId) return
    const d = new Date(`${dateStr}T00:00:00`)
    if (isNaN(d.getTime())) return
    const inSem = semesters.find((s: any) => {
      if (Number(s.school_year_id) !== Number(effectiveYearId)) return false
      if (!s.start_date || !s.end_date) return false
      const st = new Date(`${s.start_date}T00:00:00`)
      const en = new Date(`${s.end_date}T00:00:00`)
      return d >= st && d <= en
    })
    if (inSem && Number(inSem.semester_id) !== Number(selectedSemesterId)) {
      setSelectedSemesterId(Number(inSem.semester_id))
    }
  }

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

  // ── Lịch thi handlers ──
  const [examScope, setExamScope] = useState<'week' | 'semester'>('week')
  const [examDetailId, setExamDetailId] = useState<number | null>(null)

  useEffect(() => {
    if (!examMode) return
    let cancelled = false
    const turnedOn = !lastExamMode.current
    lastExamMode.current = examMode
    async function load() {
      const gradeNum = Number(examForm.gradeLevel) || 6
      const weekData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
      if (cancelled) return
      if (weekData.schedules.length === 0) {
        // Không có lịch thi trong tuần này → hiện toàn bộ lịch thi đã có trong học kì
        const semData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined })
        if (!cancelled) {
          setExamList(semData)
          setExamScope('semester')
          // When just entering exam mode and the current week has no exam but the
          // semester does, jump the grid to that exam's week so the TKB shows it
          // (an exam row only renders in the week it is scheduled).
          if (turnedOn && semData.schedules?.length > 0) {
            const target = firstMondayAtOrAfter(semData.schedules[0].week_start || selectedDateStr)
            if (target && target !== selectedDateStr) setSelectedDateStr(target)
          }
        }
      } else {
        setExamList(weekData)
        setExamScope('week')
      }
    }
    load()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examMode, examForm.gradeLevel, selectedSemesterId, selectedDateStr])

  function examDayOfWeek(dateStr: string): string {
    if (!dateStr) return '2'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '2'
    // getDay(): 0=Sun..6=Sat -> front scheme 2=Thứ 2, 3=Thứ 3, ... 7=Thứ 7
    return String(d.getDay() + 1)
  }

  function handleExamDateChange(dateStr: string) {
    const dow = examDayOfWeek(dateStr)
    setExamForm((f) => ({ ...f, examDate: dateStr, dayOfWeek: dow }))
  }

  async function handleCreateExam() {
    if (!examForm.subjectId || examForm.periods.length === 0) {
      showToast('Vui lòng chọn môn thi và tiết thi', 'error')
      return
    }
    setSavingExam(true)
    try {
      const res = await createExamSchedule({
        gradeLevel: examForm.gradeLevel,
        examDate: examForm.examDate,
        session: examForm.session,
        dayOfWeek: examForm.dayOfWeek,
        subjectId: examForm.subjectId,
        periods: examForm.periods,
        examName: examForm.examName?.trim() || undefined,
        proctorsPerRoom: examForm.proctorsPerRoom,
        semesterId: selectedSemesterId ?? undefined,
      })
      if (!res.success) {
        showToast('Lỗi tạo lịch thi: ' + (res.error || 'Lỗi cơ sở dữ liệu'), 'error')
        return
      }
      // Jump the grid to the exam's week so the created lịch thi appears right away
      // (exam rows only render in the week they are scheduled).
      const examMon = firstMondayAtOrAfter(examForm.examDate)
      if (examMon) setSelectedDateStr(examMon)
      showToast('Đã tạo lịch thi cho khối ' + examForm.gradeLevel + '!', 'success')
      const gradeNum = Number(examForm.gradeLevel) || 6
      const weekData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
      if (weekData.schedules.length === 0) {
        const semData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined })
        setExamList(semData)
        setExamScope('semester')
      } else {
        setExamList(weekData)
        setExamScope('week')
      }
      // Reload regular grid in case subjects were displaced to makeup
      if (selectedClassId) {
        const res2 = await getTimetables({ classId: selectedClassId, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
        if (res2?.data) setEntries(res2.data)
      }
    } catch (err) {
      console.error('Create exam error:', err)
      showToast('Đã xảy ra lỗi khi tạo lịch thi.', 'error')
    } finally {
      setSavingExam(false)
    }
  }

  async function handleReassignProctors(scheduleId: number) {
    try {
      const res = await reassignExamProctors(scheduleId, examForm.proctorsPerRoom)
      if (!res.success) {
        showToast('Lỗi phân công giám thị: ' + (res.error || 'Lỗi cơ sở dữ liệu'), 'error')
        return
      }
      showToast('Đã phân công giám thị!', 'success')
      const gradeNum = Number(examForm.gradeLevel) || 6
      const weekData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
      if (weekData.schedules.length === 0) {
        const semData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined })
        setExamList(semData)
        setExamScope('semester')
      } else {
        setExamList(weekData)
        setExamScope('week')
      }
    } catch (err) {
      console.error('Reassign proctors error:', err)
      showToast('Đã xảy ra lỗi khi phân công giám thị.', 'error')
    }
  }

  async function handleDeleteExam(scheduleIds: number | number[]) {
    const ids = (Array.isArray(scheduleIds) ? scheduleIds : [scheduleIds]).filter((id: number) => Number.isFinite(Number(id)))
    for (const id of ids) {
      const res = await deleteExamSchedule(id)
      if (!res.success) {
        showToast('Lỗi xóa lịch thi: ' + (res.error || 'Lỗi cơ sở dữ liệu'), 'error')
        return
      }
    }
    showToast('Đã xóa lịch thi!', 'success')
    const gradeNum = Number(examForm.gradeLevel) || 6
    const weekData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
    if (weekData.schedules.length === 0) {
      const semData = await getGradeExams({ gradeLevel: gradeNum, semesterId: selectedSemesterId ?? undefined })
      setExamList(semData)
      setExamScope('semester')
    } else {
      setExamList(weekData)
      setExamScope('week')
    }
    if (selectedClassId) {
      const res2 = await getTimetables({ classId: selectedClassId, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
      if (res2?.data) setEntries(res2.data)
    }
  }

  const filteredClasses = classes.filter((c) => {
    if (selectedGrade === 'Khối 6') return c.grade_level === 6 || c.class_name?.startsWith('6')
    if (selectedGrade === 'Khối 7') return c.grade_level === 7 || c.class_name?.startsWith('7')
    if (selectedGrade === 'Khối 8') return c.grade_level === 8 || c.class_name?.startsWith('8')
    if (selectedGrade === 'Khối 9') return c.grade_level === 9 || c.class_name?.startsWith('9')
    return true
  })

  const clearGradeNum = (() => {
    const m = (selectedGrade || '').match(/(\d)/)
    return m ? Number(m[1]) : 6
  })()

  async function handleClearGrade() {
    if (clearingGrade) return
    setClearingGrade(true)
    try {
      let res
      if (clearScope === 'hk1') {
        res = await clearGradeTimetable(clearGradeNum, hk1Id ?? undefined)
      } else if (clearScope === 'hk2') {
        res = await clearGradeTimetable(clearGradeNum, hk2Id ?? undefined)
      } else {
        res = await clearGradeTimetable(clearGradeNum, selectedSemesterId ?? undefined, selectedDateStr)
      }
      if (!res.success) {
        showToast('Lỗi xóa TKB: ' + (res.error || 'Lỗi cơ sở dữ liệu'), 'error')
        return
      }
      showToast(`Đã xóa ${res.data?.deleted ?? 0} tiết thời khóa biểu ${selectedGrade}!`, 'success')
      setConfirmClearGrade(false)
      if (selectedClassId) {
        const r2 = await getTimetables({ classId: selectedClassId, semesterId: selectedSemesterId ?? undefined, weekStart: selectedDateStr })
        if (r2?.data) setEntries(r2.data)
      }
    } catch (err) {
      console.error('Clear grade error:', err)
      showToast('Đã xóa lỗi khi xóa TKB.', 'error')
    } finally {
      setClearingGrade(false)
    }
  }

  // ── Dynamic stats computed from real data ──────────────────
  const totalPeriods = entries.length  // periods scheduled for current class
  const totalSlotsInWeek = 28
  const coveragePct = totalSlotsInWeek > 0 ? Math.round((Math.min(totalPeriods, totalSlotsInWeek) / totalSlotsInWeek) * 100) : 0
  const scheduledClassCount = filteredClasses.length > 0 ? filteredClasses.length : classes.length

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)

  // Homeroom teacher of the currently selected class, so the manual scheduler
  // can prioritise/mark them when they teach the current subject.
  const homeroomTeacherId = selectedClass?.homeroom_teacher_id ? Number(selectedClass.homeroom_teacher_id) : null
  const orderedQualifiedTeachers = homeroomTeacherId
    ? [...qualifiedTeachers].sort((a, b) =>
        Number(a.teacher_id) === homeroomTeacherId ? -1 : Number(b.teacher_id) === homeroomTeacherId ? 1 : 0
      )
    : qualifiedTeachers

  function getEntry(dayIdx: number, periodNo: number): TimetableEntry | undefined {
    return entries.find((e) => {
      const d = serverDayToFront(String(e.day_of_week))
      const p = Number(e.period_no ?? 1)
      return d === dayIdx && p === periodNo
    })
  }

  function getSubjectForEntry(entry: TimetableEntry | undefined): DbSubject | undefined {
    if (!entry) return undefined
    if (entry.custom_subject_name) {
      return {
        subject_id: entry.subject_id,
        subject_code: 'T',
        subject_name: entry.custom_subject_name,
      }
    }
    const rawSub: any = entry.subjects
    if (rawSub) {
      if (Array.isArray(rawSub) && rawSub.length > 0) return rawSub[0]
      if (typeof rawSub === 'object' && rawSub.subject_name) return rawSub as DbSubject
    }
    if (entry.subject_id) {
      return displaySubjects.find((s) => Number(s.subject_id) === Number(entry.subject_id))
    }
    return undefined
  }

  function getSubjectGroupKey(entry: TimetableEntry | undefined): string | null {
    if (!entry) return null
    if (entry.custom_subject_name) return `custom:${entry.custom_subject_name}`
    const subj = getSubjectForEntry(entry)
    return subj?.subject_id != null ? `id:${subj.subject_id}` : null
  }

  const displaySubjects = (subjects.length > 0 ? subjects : DEFAULT_SUBJECTS).filter(
    (s) => !String(s.subject_code || '').toUpperCase().startsWith('TDK')
  )
  const configuredCount = Object.values(scheduleRules).filter((r) => r.periods_per_week > 0).length
  const fixedRoomName = allRooms.find((r) => r.room_id === fixedRoomId)?.room_name ?? null
  const roomForSubject = (subj?: DbSubject) =>
    specialRoomForSubject(subj?.subject_name || '', subj?.subject_code || '', allRooms) ?? fixedRoomName ?? ''
  // Dynamic N-period streak calculation for merging 2, 3, 4... consecutive periods
  function getConsecutiveStreakInfo(
    dayIdx: number,
    periodNo: number,
    sessionSlots: { period: number }[]
  ) {
    const current = getEntry(dayIdx, periodNo)
    const currentSubj = getSubjectGroupKey(current)

    if (!currentSubj) {
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
      const nextSubj = getSubjectGroupKey(nextEntry)
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
    setShowTeacherPicker(false)
    setModalOpen(true)
  }

  async function handleAssignSubject(subjectId: number, targetDayIdx?: number, targetPeriodNo?: number, customName?: string) {
    const dayIdx = targetDayIdx !== undefined ? targetDayIdx : activeCell?.dayIdx ?? 0
    const periodNo = targetPeriodNo !== undefined ? targetPeriodNo : activeCell?.periodNo ?? 1
    const targetClassId = selectedClassId || 1

    setSaving(true)
    try {
      const selectedSubj = displaySubjects.find((s) => s.subject_id === subjectId) || {
        subject_id: subjectId,
        subject_code: 'MON',
        subject_name: 'Môn học',
      }
      const result = await createTimetable({
        classId: targetClassId,
        subjectId,
        semesterId: selectedSemesterId || 1,
        dayOfWeek: frontDayToServer(dayIdx),
        periodNo,
        weekStart: selectedDateStr,
        room: roomForSubject(selectedSubj) || undefined,
        custom_subject_name: customName,
      })

      const newEntry: TimetableEntry = {
        schedule_id: result.success ? result.data?.[0]?.schedule_id || Date.now() : Date.now(),
        class_id: targetClassId,
        subject_id: subjectId,
        custom_subject_name: customName,
        day_of_week: frontDayToServer(dayIdx),
        period_no: periodNo,
        subjects: customName ? { subject_id: subjectId, subject_code: 'T', subject_name: customName } : selectedSubj,
        room: roomForSubject(selectedSubj) || undefined,
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
      showToast('Đã xảy ra lỗi khi gán môn học.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // KHTN subject expands into Hóa / Lý / Sinh sub-disciplines on selection.
  const khtnSubjectId = displaySubjects.find(
    (s) => /khoa hoc tu nhien|khtn/i.test(normText(s.subject_name))
  )?.subject_id
  const KHTN_PARTS = ['KHTN - Hóa', 'KHTN - Lý', 'KHTN - Sinh']
  const [khtnOpen, setKhtnOpen] = useState<boolean>(false)

  async function handleAssignCustomSubject() {
    if (!customSubjectName.trim() || !activeCell) return
    setSaving(true)
    try {
      const dayIdx = activeCell.dayIdx
      const periodNo = activeCell.periodNo
      const targetClassId = selectedClassId || 1
      const name = customSubjectName.trim()
      const teacher = customTeacherName.trim()

      const placeholderSubjectId = displaySubjects[0]?.subject_id || 1
      const customSubjObj: DbSubject = {
        subject_id: placeholderSubjectId,
        subject_code: 'T',
        subject_name: name,
      }

      const result = await createTimetable({
        classId: targetClassId,
        subjectId: placeholderSubjectId,
        semesterId: selectedSemesterId || 1,
        dayOfWeek: frontDayToServer(dayIdx),
        periodNo,
        weekStart: selectedDateStr,
        room: customRoom && customRoom !== 'Tất cả phòng' ? customRoom : (roomForSubject(customSubjObj) || undefined),
        custom_subject_name: name,
        custom_teacher_name: teacher || undefined,
      })

      const newEntry: TimetableEntry = {
        schedule_id: result.success ? result.data?.[0]?.schedule_id || Date.now() : Date.now(),
        class_id: targetClassId,
        subject_id: placeholderSubjectId,
        custom_subject_name: name,
        custom_teacher_name: teacher || undefined,
        day_of_week: frontDayToServer(dayIdx),
        period_no: periodNo,
        subjects: customSubjObj,
        teacher_name: teacher || undefined,
        teachers: teacher ? { teacher_id: 0, full_name: teacher } : undefined,
        room: customRoom && customRoom !== 'Tất cả phòng' ? customRoom : (roomForSubject(customSubjObj) || undefined),
      }

      setEntries((prev) => [
        ...prev.filter(
          (e) => !(serverDayToFront(e.day_of_week) === dayIdx && e.period_no === periodNo)
        ),
        newEntry,
      ])

      setCustomSubjectName('')
      setCustomTeacherName('')
      setCustomRoom('Tất cả phòng')
      setModalOpen(false)
      setQuickModalOpen(false)
    } catch (err) {
      console.error(err)
      showToast('Đã xảy ra lỗi khi gán môn tự đăng ký.', 'error')
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
      {mounted && toast && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold"
          style={{ background: toast.type === 'success' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', borderColor: 'transparent' }}
          key={Date.now()}
        >
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span>{toast.msg}</span>
        </div>,
        document.body
      )}
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
            {/* Xóa TKB toàn khối Button */}
            <button
              onClick={() => setConfirmClearGrade(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-red-300 text-red-600 hover:bg-red-50 transition-colors shadow-sm text-xs font-semibold cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Xóa TKB toàn khối</span>
            </button>

            {/* Sắp xếp 1 lớp Button */}
            <button
              onClick={() => setQuickModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#001d36] text-[#001d36] hover:bg-blue-50 transition-all shadow-sm text-xs font-semibold cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
              <span>Sắp xếp 1 lớp</span>
            </button>

            {/* Auto Schedule ALL Classes Button */}
            <button
              onClick={() => setAutoModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#003366] to-[#0066cc] text-white hover:opacity-90 transition-all shadow-md text-xs font-semibold cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>Sắp xếp tất cả lớp</span>
            </button>

            {/* Lịch thi toggle */}
            <button
              onClick={() => setExamMode((v) => !v)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all shadow-sm text-xs font-semibold cursor-pointer active:scale-95 ${
                examMode ? 'bg-[#6d28d9] text-white border border-[#6d28d9]' : 'bg-white border border-gray-200 text-[#111c2d] hover:bg-purple-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>{examMode ? 'Đang xem: Lịch thi' : 'Lịch thi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Stats Row */}
      {/* ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Lớp đã xếp lịch (dynamic: count in current grade) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-[#003366] flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Lớp đã xếp lịch</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">
              {scheduledClassCount}<span className="text-xs text-gray-500 font-normal">/{filteredClasses.length || classes.length}</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-full border-4 border-blue-100 border-t-[#003366] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-[#003366]">
              {filteredClasses.length > 0 ? Math.round((scheduledClassCount / filteredClasses.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Card 2 - Tiết đã xếp cho lớp hiện tại (dynamic) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-gray-500 flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tiết đã xếp ({selectedClass?.class_name || '—'})</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">{coveragePct}%</span>
          </div>
          <div className="w-11 h-11 rounded-full border-4 border-gray-100 border-t-gray-500 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-gray-600 text-[20px]">schedule</span>
          </div>
        </div>

        {/* Card 3 - Tổng tiết / tuần (dynamic) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border-t-4 border-blue-600 flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tổng tiết / tuần</span>
            <span className="text-2xl font-extrabold text-[#001d36] mt-1">{totalPeriods}</span>
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

      {/* ────────────────────────────────────────────────── */}
      {/* Filter Bar */}
      {/* ────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-4 shadow-sm border border-gray-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
          {/* Khối */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Khối</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#003366]"
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
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#003366]"
            >
              {filteredClasses.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
              {filteredClasses.length === 0 && <option value="" disabled>Không có lớp trong khối này</option>}
            </select>
          </div>

          {/* Phòng học */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phòng học</label>
            <div className="flex items-center gap-1.5">
              <div className="bg-[#003366]/5 border border-[#003366]/20 rounded-lg px-3 py-2 text-xs font-semibold text-[#003366] min-w-[110px] flex items-center justify-between gap-2">
                <span>{fixedRoomNameState ?? 'Chưa đặt'}</span>
                {!fixedRoomNameState && <span className="text-amber-600 material-symbols-outlined text-[16px]">warning</span>}
              </div>
              <button
                onClick={handleOpenRoomsModal}
                title="Quản lý phòng học của lớp"
                className="p-2 bg-gray-100 hover:bg-[#003366] hover:text-white text-[#003366] rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">door_sliding</span>
              </button>
            </div>
          </div>
        </div>

        <button className="self-end md:self-center p-2.5 bg-[#001d36] text-white rounded-lg hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">filter_alt</span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────── */}
      {/* Main Timetable Grid View */}
      {/* ────────────────────────────────────────────────── */}

      {/* ── Lịch thi panel ── */}
      {examMode && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-[#4c1d95] to-[#6d28d9] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
              <span className="text-sm font-bold tracking-wide">Lịch thi theo khối</span>
            </div>
            <span className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full font-semibold">{examList.schedules.length} lịch thi {examScope === 'week' ? '(tuần này)' : '(học kì)'}</span>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Khối</label>
                <select
                  value={examForm.gradeLevel}
                  onChange={(e) => setExamForm((f) => ({ ...f, gradeLevel: Number(e.target.value) }))}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#6d28d9]"
                >
                  <option value={6}>Khối 6</option>
                  <option value={7}>Khối 7</option>
                  <option value={8}>Khối 8</option>
                  <option value={9}>Khối 9</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Môn thi</label>
                <select
                  value={examForm.subjectId}
                  onChange={(e) => setExamForm((f) => ({ ...f, subjectId: Number(e.target.value) }))}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#6d28d9]"
                >
                  {displaySubjects.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Kì thi</label>
                <select
                  value={examForm.examName}
                  onChange={(e) => setExamForm((f) => ({ ...f, examName: e.target.value }))}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#6d28d9]"
                >
                  <option value="" disabled>Chọn kì thi</option>
                  <option value="Giữa kì 1">GK1 - Giữa kì 1</option>
                  <option value="Giữa kì 2">GK2 - Giữa kì 2</option>
                  <option value="Học kì 1">HK1 - Học kì 1</option>
                  <option value="Học kì 2">HK2 - Học kì 2</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Số giám thị / phòng</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[1, 2].map((g) => (
                    <button
                      key={g}
                      onClick={() => setExamForm((f) => ({ ...f, proctorsPerRoom: g }))}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${examForm.proctorsPerRoom === g ? 'bg-[#6d28d9] text-white border-[#6d28d9]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {g} giám thị
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ngày thi (cụ thể)</label>
                <CustomDatePicker
                  value={examForm.examDate}
                  onChange={handleExamDateChange}
                />
                <p className="text-[10px] text-gray-400 mt-1">Tự nhận thứ trong tuần: Thứ {examForm.dayOfWeek}</p>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Buổi thi</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { key: 'morning', label: 'Sáng' },
                    { key: 'afternoon', label: 'Chiều' },
                    { key: 'both', label: 'Cả ngày' },
                  ] as const).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setExamForm((f) => ({ ...f, session: s.key }))}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${examForm.session === s.key ? 'bg-[#6d28d9] text-white border-[#6d28d9]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tiết thi</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => {
                    const active = examForm.periods.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => setExamForm((f) => ({ ...f, periods: active ? f.periods.filter((x) => x !== p) : [...f.periods, p] }))}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${active ? 'bg-[#6d28d9] text-white border-[#6d28d9]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleCreateExam}
                disabled={savingExam}
                className="w-full py-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {savingExam ? 'Đang tạo...' : 'Tạo lịch thi cho khối'}
              </button>
            </div>

            {/* Danh sách lịch thi */}
            <div className="lg:col-span-2 space-y-3">
              {(() => {
                // Shared helper to compute the concrete exam date from week_start + day_of_week
                const dateOf = (r: any): string => {
                  if (!r.week_start) return ''
                  const monday = new Date(`${r.week_start}T00:00:00Z`)
                  monday.setUTCDate(monday.getUTCDate() + (Number(r.day_of_week) - 2))
                  return monday.toISOString().split('T')[0].split('-').reverse().join('/')
                }
                // Group by subject exam (subject + exam name + date) so one subject = one row
                const groupMap = new Map<string, any[]>()
                for (const s of examList.schedules) {
                  const key = `${s.subject_id}_${s.exam_name || ''}_${dateOf(s)}`
                  if (!groupMap.has(key)) groupMap.set(key, [])
                  groupMap.get(key)!.push(s)
                }
                const examGroups = [...groupMap.values()].map((rows) => {
                  const sorted = [...rows].sort((a, b) => Number(a.period_no) - Number(b.period_no))
                  const first = sorted[0]
                  const classMap = new Map<number, string>()
                  for (const r of rows) {
                    const cid = Number(r.class_id)
                    if (cid && !classMap.has(cid)) classMap.set(cid, r.classes?.class_name || `Lớp ${r.class_id}`)
                  }
                  const studentsTotal = [...classMap.keys()].reduce((sum, cid) => {
                    const r = rows.find((x) => Number(x.class_id) === cid)
                    return sum + (Number(r?.students_count) || 0)
                  }, 0)
                  const anchorScheduleId = sorted.find((r) =>
                    examList.assignments.some((a: any) => Number(a.exam_schedule_id) === Number(r.schedule_id))
                  )?.schedule_id ?? Number(first.schedule_id)
                  return {
                    ...first,
                    scheduleId: Number(anchorScheduleId),
                    examDate: dateOf(first),
                    classLabel: [...classMap.values()].join(', '),
                    periods: [...new Set(sorted.map((r) => Number(r.period_no)))].sort((a, b) => a - b),
                    scheduleIds: [...classMap.keys()].map((cid) => {
                      const rowsOfClass = sorted.filter((r) => Number(r.class_id) === cid)
                      return rowsOfClass.map((r) => Number(r.schedule_id))
                    }).flat(),
                    studentsTotal,
                  }
                })
                const formatPeriods = (periods: number[]): string => {
                  const unique = [...new Set(periods)].sort((a, b) => a - b)
                  const ranges: string[] = []
                  let start = unique[0], prev = unique[0]
                  for (let i = 1; i <= unique.length; i++) {
                    if (i === unique.length || unique[i] !== prev + 1) {
                      ranges.push(start === prev ? `Tiết ${prev}` : `Tiết ${start}-${prev}`)
                      if (i < unique.length) start = unique[i]
                    }
                    if (i < unique.length) prev = unique[i]
                  }
                  return ranges.join(', ')
                }
                return examGroups.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-purple-200 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-purple-200 block mb-2">fact_check</span>
                  <p className="text-gray-400 font-semibold">{examScope === 'week' ? 'Chưa có lịch thi cho khối này trong tuần' : 'Chưa có lịch thi cho khối này trong học kì'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kì thi / Môn</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày thi</th>
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lớp</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tiết</th>
                        <th className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thí sinh</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {examGroups.map((row: any) => {
                        const subj = row.custom_subject_name || row.subjects?.subject_name || 'THI'
                        const cls = row.classLabel || `Lớp ${row.class_id}`
                        const seatCount = Number(row.studentsTotal ?? 0)
                        return (
                          <React.Fragment key={row.scheduleId}>
                          <tr className="hover:bg-purple-50/40">
                            <td className="px-4 py-2.5">
                              <span className="inline-flex flex-col items-start gap-0.5">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[9px] font-bold">THI</span>
                                  <span className="text-xs font-bold text-gray-900">{subj}</span>
                                </span>
                                {row.exam_name ? (
                                  <span className="text-[10px] font-semibold text-gray-400">{row.exam_name}</span>
                                ) : null}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap">{row.examDate || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-700">{cls}</td>
                            <td className="px-4 py-2.5 text-center text-xs font-bold text-gray-800">{formatPeriods(row.periods)}</td>
                            <td className="px-4 py-2.5 text-center text-xs text-gray-600">{seatCount} HS</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setExamDetailId(prev => (prev === row.scheduleId ? null : Number(row.scheduleId)))}
                                  className="px-2.5 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  {examDetailId === row.scheduleId ? 'Thu gọn' : 'Xem chi tiết'}
                                </button>
                                <button
                                  onClick={() => handleDeleteExam(row.scheduleIds)}
                                  className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                >
                                  Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                          {examDetailId === row.scheduleId && (
                            <tr>
                              <td colSpan={6} className="px-4 py-3 bg-purple-50/40 border-t border-purple-100">
                                <div className="flex flex-wrap gap-3">
                                  {(() => {
                                    const groupIds = new Set((row.scheduleIds || []).map((id: any) => Number(id)))
                                    const examAssignments = examList.assignments.filter((a: any) => Number(a.exam_schedule_id) === Number(row.scheduleId) || groupIds.has(Number(a.exam_schedule_id)))
                                    const groupProctors = examList.proctors.filter((p: any) => Number(p.exam_schedule_id) === Number(row.scheduleId) || groupIds.has(Number(p.exam_schedule_id)))
                                    const assignRoomIds = new Set(examAssignments.map((a: any) => a.room_id))
                                    const proctorRoomIds = new Set(groupProctors.map((p: any) => p.room_id))
                                    const roomIds = Array.from(new Set([...assignRoomIds, ...proctorRoomIds])).filter((r: any) => r != null)
                                    if (roomIds.length === 0) {
                                      return (
                                        <div key={`${row.scheduleId}-noroom`} className="flex-1 min-w-[220px] rounded-lg border border-purple-100 bg-white p-3">
                                          <p className="text-xs font-bold text-gray-800 mb-2">Không có phòng thi / chưa xếp chỗ</p>
                                          <button
                                            onClick={() => handleReassignProctors(row.scheduleId)}
                                            className="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                                          >
                                            Phân công giám thị
                                          </button>
                                        </div>
                                      )
                                    }
                                    return roomIds.map((roomId: any) => {
                                      const roomAssignments = examAssignments.filter((a: any) => Number(a.room_id) === Number(roomId))
                                      const assignRoom = roomAssignments[0]?.rooms?.room_name
                                      const proct = groupProctors.find((p: any) => Number(p.room_id) === Number(roomId))
                                      const roomName = assignRoom || (Array.isArray(proct?.rooms) ? proct.rooms[0]?.room_name : proct?.rooms?.room_name) || `Phòng ${roomId}`
                                      const roomProctors = groupProctors.filter((p: any) => Number(p.room_id) === Number(roomId))
                                      const formatProctor = (p: any) =>
                                        p.teachers?.full_name || `GV ${p.teacher_id}`
                                      return (
                                        <div key={`${row.scheduleId}-${roomId}`} className="flex-1 min-w-[220px] rounded-lg border border-purple-100 bg-white p-3">
                                          <p className="text-xs font-bold text-gray-800 mb-1.5">📋 {roomName} — {roomAssignments.length} thí sinh</p>
                                          {roomProctors.length > 0 ? (
                                            <div className="mb-2 flex flex-wrap gap-1">
                                              {roomProctors.map((p: any, i: number) => (
                                                <span key={`${p.exam_schedule_id}-${p.teacher_id}-${i}`} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-semibold">
                                                  {formatProctor(p)}
                                                </span>
                                              ))}
                                            </div>
                                          ) : (
                                            <div className="mb-2 flex items-center gap-1.5">
                                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-semibold">Chưa phân công giám thị</span>
                                              <button
                                                onClick={() => handleReassignProctors(row.scheduleId)}
                                                className="px-2 py-0.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded text-[9px] font-bold cursor-pointer transition-colors"
                                              >
                                                Phân công giám thị
                                              </button>
                                            </div>
                                          )}
                                          <div className="flex flex-wrap gap-1">
                                            {roomAssignments.slice(0, 30).map((a: any) => (
                                              <span key={`${row.scheduleId}-${a.exam_schedule_id}-${a.student_id}`} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[9px] font-semibold">
                                                {a.students?.full_name?.split(' ').pop() || `#${a.student_id}`}
                                                <span className="opacity-60"> (SBD {a.seat_no})</span>
                                              </span>
                                            ))}
{/* Học bù */}
              {examList.makeup.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/40 overflow-hidden">
                  <div className="px-4 py-2 bg-amber-100/70 border-b border-amber-200 text-[10px] font-bold text-amber-800 uppercase tracking-wider">Lịch học bù (do lịch thi)</div>
                  <div className="divide-y divide-amber-100">
                    {examList.makeup.map((m: any) => (
                      <div key={m.makeup_id} className="px-4 py-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800">{m.classes?.class_name || `Lớp ${m.class_id}`} — {m.note || 'Học bù'}</p>
                          <p className="text-[10px] text-gray-500">Dời đến Thứ {m.day_of_week} — Tiết {m.period_no} ({m.makeup_date || ''})</p>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-[9px] font-bold">Học bù</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
                                      )
                                    })
                                  })()}
                                </div>
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )})()}

              </div>
          </div>
        </div>
      )}

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
                onClick={() => selectDateAndSyncSemester(d.isoDate)}
                className={`p-3 border-r last:border-r-0 border-gray-200 text-center cursor-pointer transition-colors ${d.isCurrentSelected ? 'bg-[#003366] text-white shadow-md' : 'hover:bg-gray-200/60'
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
                    const subject = getSubjectForEntry(entry)
                    const theme = subject ? getSubjectTheme(subject.subject_id) : null
                    const isExam = Number((entry as any)?.timetable_type_id) === 2
                    const teacherName = (entry as any)?.custom_teacher_name || (entry as any)?.teachers?.full_name || (entry as any)?.teacher_name || (Array.isArray((entry as any)?.teachers) ? (entry as any)?.teachers[0]?.full_name : null) || 'Chưa phân công'

                    const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, MORNING_SLOTS)

                    if (streak.isChild) {
                      return (
                        <div
                          key={`m-cell-${d.dayIdx}-${slot.period}`}
                          onClick={() => handleCellClick(d.dayIdx, slot.period)}
                          className="p-1.5 h-[88px] opacity-0 relative z-20 cursor-pointer"
                        />
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
                        className={`p-1.5 ${cardHeight} flex flex-col cursor-pointer transition-all ${d.isCurrentSelected ? 'bg-blue-50/50 ring-1 ring-[#003366]/30' : 'hover:bg-blue-50/20'
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
                          className={`h-full w-full rounded-lg border p-2.5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all ${isExam ? 'border-purple-400 bg-purple-50 text-purple-900' : `${theme?.bg}`}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                {isExam && (
                                  <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide w-fit mb-1">Thi</span>
                                )}
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isExam && entry?.exam_name && (
                                  <span className="text-[10px] font-semibold text-purple-700 block mt-0.5 truncate">{entry.exam_name}</span>
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
                              <span className="truncate">{isExam ? 'Lịch thi' : `GV: ${teacherName}`}</span>
                              <span className="font-semibold">{entry?.room || roomForSubject(subject)}</span>
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
                    const subject = getSubjectForEntry(entry)
                    const theme = subject ? getSubjectTheme(subject.subject_id) : null
                    const isExam = Number((entry as any)?.timetable_type_id) === 2
                    const teacherName = (entry as any)?.custom_teacher_name || (entry as any)?.teachers?.full_name || (entry as any)?.teacher_name || (Array.isArray((entry as any)?.teachers) ? (entry as any)?.teachers[0]?.full_name : null) || 'Chưa phân công'

                    const streak = getConsecutiveStreakInfo(d.dayIdx, slot.period, AFTERNOON_SLOTS)

                    if (streak.isChild) {
                      return (
                        <div
                          key={`a-cell-${d.dayIdx}-${slot.period}`}
                          onClick={() => handleCellClick(d.dayIdx, slot.period)}
                          className="p-1.5 h-[88px] opacity-0 relative z-20 cursor-pointer"
                        />
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
                        className={`p-1.5 flex flex-col cursor-pointer transition-all ${d.isCurrentSelected ? 'bg-amber-50/40 ring-1 ring-amber-500/30' : 'hover:bg-amber-50/20'
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
                            className={`h-full w-full rounded-lg border p-2.5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all ${isExam ? 'border-purple-400 bg-purple-50 text-purple-900' : `${theme?.bg}`}`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                {isExam && (
                                  <span className="text-[9px] font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase tracking-wide w-fit mb-1">Thi</span>
                                )}
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isExam && entry?.exam_name && (
                                  <span className="text-[10px] font-semibold text-purple-700 block mt-0.5 truncate">{entry.exam_name}</span>
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
                              <span className="truncate">{isExam ? 'Lịch thi' : `GV: ${teacherName}`}</span>
                              <span className="font-semibold">{entry?.room || roomForSubject(subject)}</span>
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
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#001d36]">
                          Môn hiện tại: {activeEntry.subjects?.subject_name || getSubjectForEntry(activeEntry)?.subject_name || 'Đã xếp môn'}
                        </p>
                        <p className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                          <span className="text-gray-600">Giáo viên bộ môn:</span>
                          <span className={(activeEntry as any)?.teachers?.full_name || (activeEntry as any)?.teacher_name ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            {(activeEntry as any)?.teachers?.full_name || (activeEntry as any)?.teacher_name || 'Chưa phân công'}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={handleDeleteSubject}
                        disabled={saving}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? 'Đang xóa...' : 'Xóa tiết'}
                      </button>
                    </div>

                    {/* Teacher Selector Trigger Button */}
                    <div className="pt-2 border-t border-blue-100 flex flex-col gap-2">
                      <button
                        onClick={async () => {
                          setLoadingTeachers(true)
                          setShowTeacherPicker(true)
                          try {
                            const activeSubjId = activeEntry.subject_id
                            const tRes = await getTeachers({ subjectId: activeSubjId, limit: 100 })
                            let matched = tRes.data || []
                            if (matched.length === 0) {
                              const allRes = await getTeachers({ limit: 100 })
                              const allT = allRes.data || []
                              const currentSubj = activeEntry.subjects?.subject_name || getSubjectForEntry(activeEntry)?.subject_name || ''
                              matched = allT.filter((t: any) =>
                                Number(t.subject_id) === Number(activeSubjId) ||
                                (currentSubj && t.department && t.department.toLowerCase().includes(currentSubj.toLowerCase()))
                              )
                              if (matched.length === 0) matched = allT
                            }
                            setQualifiedTeachers(matched)
                          } catch (e) {
                            console.error(e)
                          } finally {
                            setLoadingTeachers(false)
                          }
                        }}
                        className="w-full py-2 bg-gradient-to-r from-[#003366] to-[#0066cc] hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_search</span>
                        <span>Chọn giáo viên phụ trách môn này từ CSDL</span>
                      </button>

                      {showTeacherPicker && (
                        <div className="mt-2 p-3 bg-white border border-blue-300 rounded-xl space-y-2 shadow-sm animate-in fade-in duration-150">
                          <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                            <span className="text-[11px] font-bold text-[#003366] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">school</span>
                              Danh sách Giáo viên CSDL {activeEntry?.subjects?.subject_name ? `(${activeEntry.subjects.subject_name})` : ''}:
                            </span>
                            <button onClick={() => setShowTeacherPicker(false)} className="text-[11px] text-gray-500 hover:text-gray-800 font-bold px-1">
                              ✕ Đóng
                            </button>
                          </div>

                          {loadingTeachers ? (
                            <div className="p-3 text-center text-xs text-gray-500 font-medium">Đang truy vấn giáo viên từ cơ sở dữ liệu...</div>
                          ) : qualifiedTeachers.length === 0 ? (
                            <div className="p-3 text-center text-xs text-gray-500 font-medium">Không tìm thấy giáo viên nào trong CSDL</div>
                          ) : (
                            <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 rounded-lg border border-gray-200">
                              {orderedQualifiedTeachers.map((t: any) => (
                                <div
                                  key={t.teacher_id}
                                  onClick={() => handleAssignTeacherToEntry(t.teacher_id, t.full_name)}
                                  className="p-2 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-gray-900">{t.full_name}</span>
                                      {homeroomTeacherId === Number(t.teacher_id) && (
                                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold border border-amber-300">GVCN</span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-gray-500">Bộ môn: {t.subject || t.department || 'Chung'} | Mã: {t.teacher_code || `GV${t.teacher_id}`}</span>
                                  </div>
                                  <span className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold">
                                    Chọn
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-2">
                    {activeEntry ? 'Thay đổi sang môn học khác:' : 'Chọn môn học gán vào tiết:'}
                  </label>

                  {khtnOpen && (
                    <div className="mb-3 p-3 rounded-xl border border-[#00897b]/40 bg-teal-50/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#00796b]">Phân môn Khoa học tự nhiên:</span>
                        <button
                          onClick={() => setKhtnOpen(false)}
                          className="text-[11px] text-gray-500 hover:text-gray-800 font-bold px-1"
                        >
                          ← Quay lại
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {KHTN_PARTS.map((part) => (
                          <button
                            key={part}
                            onClick={() => handleAssignSubject(khtnSubjectId!, undefined, undefined, part)}
                            disabled={saving}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all bg-white text-gray-900 disabled:opacity-50 cursor-pointer shadow-xs ${
                              part.includes('Hóa') ? 'border-[#ef5350]/50' : part.includes('Lý') ? 'border-[#1976d2]/50' : 'border-[#43a047]/50'
                            }`}
                          >
                            <span className="text-xs font-bold text-gray-900">{part}</span>
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-[#00796b]">Chọn</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {displaySubjects.map((subj) => {
                      const theme = getSubjectTheme(subj.subject_id)
                      const isKhtn = khtnSubjectId != null && Number(subj.subject_id) === Number(khtnSubjectId)
                      return (
                        <button
                          key={subj.subject_id}
                          onClick={() => (isKhtn ? setKhtnOpen(true) : handleAssignSubject(subj.subject_id))}
                          disabled={saving}
                          className={`p-3.5 rounded-xl border text-left flex flex-col justify-between hover:scale-[1.03] active:scale-95 transition-all ${theme.bg} disabled:opacity-50 min-h-[76px] cursor-pointer shadow-xs`}
                        >
                          <span className="text-xs font-bold leading-tight">{subj.subject_name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold self-start mt-2 ${theme.tag}`}>
                            {isKhtn ? 'Phân môn' : (subj.subject_code || 'MON')}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Môn tự đăng ký */}
                <div className="border-t border-dashed border-gray-200 pt-4">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-[15px] text-violet-600">edit_note</span>
                    Môn tự đăng ký
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tên môn học</label>
                      <input
                        type="text"
                        value={customSubjectName}
                        onChange={e => setCustomSubjectName(e.target.value)}
                        placeholder="VD: Kiểm tra giữa kỳ, Thể dục tự chọn..."
                        className="px-3 py-2 text-xs text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-300"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Giáo viên phụ trách</label>
                      <input
                        type="text"
                        value={customTeacherName}
                        onChange={e => setCustomTeacherName(e.target.value)}
                        placeholder="VD: Nguyễn Văn A..."
                        className="px-3 py-2 text-xs text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-300"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Phòng học</label>
                      <select
                        value={customRoom}
                        onChange={e => setCustomRoom(e.target.value)}
                        className="px-3 py-2 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-300"
                      >
                        <option value="Tất cả phòng">Theo môn (mặc định)</option>
                        {allRooms.map(r => (
                          <option key={r.room_id} value={r.room_name}>{r.room_name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleAssignCustomSubject}
                      disabled={saving || !customSubjectName.trim()}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer mt-1"
                    >
                      Gán môn tự đăng ký
                    </button>
                  </div>
                </div>
              </div>{/* end scrollable body */}

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
                        className={`py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${quickDayIdx === w.dayIdx
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
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${quickPeriodNo === p
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[25vh] overflow-y-auto p-0.5">
                    {displaySubjects.map((subj) => {
                      const isSelected = quickSubjectId === subj.subject_id
                      const theme = getSubjectTheme(subj.subject_id)
                      return (
                        <button
                          key={subj.subject_id}
                          onClick={() => setQuickSubjectId(subj.subject_id)}
                          className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${isSelected
                            ? 'bg-[#003366] text-white border-[#003366] ring-2 ring-[#003366]/40 shadow-md'
                            : `${theme.bg} hover:scale-[1.02]`
                            } cursor-pointer min-h-[72px]`}
                        >
                          <span className="text-xs font-bold leading-tight">{subj.subject_name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold self-start mt-2 ${isSelected ? 'bg-white/20 text-white' : theme.tag
                            }`}>
                            {subj.subject_code || 'MON'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Môn tự đăng ký */}
                <div className="border-t border-dashed border-gray-200 pt-3">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-[14px] text-violet-600">edit_note</span>
                    Môn tự đăng ký
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={customSubjectName}
                      onChange={e => setCustomSubjectName(e.target.value)}
                      placeholder="Tên môn: VD Kiểm tra giữa kỳ..."
                      className="px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={customTeacherName}
                      onChange={e => setCustomTeacherName(e.target.value)}
                      placeholder="Giáo viên phụ trách..."
                      className="px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <select
                      value={customRoom}
                      onChange={e => setCustomRoom(e.target.value)}
                      className="px-3 py-1.5 text-xs text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-violet-500"
                    >
                      <option value="Tất cả phòng">Phòng: theo môn</option>
                      {allRooms.map(r => (
                        <option key={r.room_id} value={r.room_name}>{r.room_name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignCustomSubject}
                      disabled={saving || !customSubjectName.trim()}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Gán môn tự đăng ký
                    </button>
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

      {/* ══════════════════════════════════════════════════ */}
      {/* AUTO SCHEDULE ALL CLASSES MODAL */}
      {/* ══════════════════════════════════════════════════ */}
      {mounted && autoModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#003366] to-[#0066cc] text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-wide">Sắp Xếp Thời Khóa Biểu Tự Động Toàn Trường</h2>
                  <p className="text-xs opacity-80 mt-0.5">Phân bổ môn học &amp; giáo viên thông minh cho toàn bộ lớp học</p>
                </div>
              </div>
              <button
                onClick={() => { setAutoModalOpen(false); setAutoResult(null) }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {!autoResult ? (
                <div className="flex flex-col gap-5">
                  {/* Scope Selector */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#003366]">filter_list</span>
                      Phạm vi xếp lịch
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => setAutoScope('all')}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${autoScope === 'all' ? 'border-[#003366] bg-[#003366]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${autoScope === 'all' ? 'border-[#003366]' : 'border-gray-300'}`}>
                            {autoScope === 'all' && <div className="w-2 h-2 rounded-full bg-[#003366]" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${autoScope === 'all' ? 'text-[#001d36]' : 'text-gray-700'}`}>Toàn trường</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Xếp lịch cho tất cả {classes.length} lớp</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setAutoScope('selectedGrade')}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${autoScope === 'selectedGrade' ? 'border-[#003366] bg-[#003366]/5' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${autoScope === 'selectedGrade' ? 'border-[#003366]' : 'border-gray-300'}`}>
                            {autoScope === 'selectedGrade' && <div className="w-2 h-2 rounded-full bg-[#003366]" />}
                          </div>
                          <div>
                            <p className={`text-xs font-bold ${autoScope === 'selectedGrade' ? 'text-[#001d36]' : 'text-gray-700'}`}>Chỉ khối đang chọn</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{selectedGrade} — {gradeFilteredClasses.length} lớp</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    <div className="mt-3.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#003366]">calendar_month</span>
                        Học kỳ cần xếp
                      </label>
                      <select
                        value={autoAllSemesters ? '__all__' : String(autoSemesterId ?? selectedSemesterId ?? '')}
                        onChange={(e) => {
                          if (e.target.value === '__all__') {
                            setAutoAllSemesters(true)
                            setAutoSemesterId(null)
                          } else {
                            setAutoAllSemesters(false)
                            setAutoSemesterId(Number(e.target.value) || null)
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#003366]"
                      >
                        <option value="__all__">Cả 2 học kì</option>
                        {semesters.filter((s: any) => !effectiveYearId || Number(s.school_year_id) === Number(effectiveYearId)).map((s: any) => (
                          <option key={s.semester_id} value={s.semester_id}>{s.semester_name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3.5">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[15px] text-[#00796b]">science</span>
                        Phân môn KHTN ưu tiên thêm tiết
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Hóa', 'Lý', 'Sinh'].map((part) => {
                          const selected = khtnPriority.includes(part)
                          const canSelect = khtnPriority.length < 2 || selected
                          return (
                            <button
                              key={part}
                              type="button"
                              onClick={() => {
                                if (selected) setKhtnPriority((p) => p.filter((x) => x !== part))
                                else if (canSelect) setKhtnPriority((p) => [...p, part])
                              }}
                              disabled={!canSelect}
                              className={`px-3.5 py-2 rounded-lg border-2 text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                                selected
                                  ? 'border-[#00796b] bg-[#00796b]/10 text-[#00796b]'
                                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {part} {selected ? '✓' : ''}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Chọn 1 hoặc 2 phân môn nhận tiết dư trước. Khi tổng tiết KHTN không chia hết cho 3, các môn được chọn nhận +1 tiết theo thứ tự (vd KHTN = 5, chọn Hóa → Hóa 2, Sinh 2, Lý 1; KHTN = 4 → chỉ 1 môn nhận +1).
                      </p>
                    </div>
                  </div>

                  {/* Rule configurator */}
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-[#003366] mb-1">
                      <span className="material-symbols-outlined text-[24px]">tune</span>
                      <h3 className="text-sm font-bold uppercase tracking-wider">Quy Tắc Xếp Lịch</h3>
                    </div>
                    <p className="text-[11px] text-gray-600 mb-4">
                      Đặt số tiết/tuần, buổi học và tiết đôi cho từng môn. Môn không đặt quy tắc sẽ dùng mặc định hệ thống. Quy tắc được lưu lại để tái sử dụng.
                    </p>

                    <div className="max-h-[260px] overflow-y-auto rounded-lg border border-blue-200 bg-white/70">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-[#003366] text-white">
                          <tr>
                            <th className="p-2 text-left font-semibold">Môn học</th>
                            <th className="p-2 text-center font-semibold w-[90px]">Số tiết / tuần</th>
                            <th className="p-2 text-center font-semibold w-[110px]">Buổi</th>
                            <th className="p-2 text-center font-semibold w-[100px]">Tiết liền</th>
                            <th className="p-2 text-left font-semibold w-[180px]">Giáo viên</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displaySubjects.map((subj) => {
                            const rule = scheduleRules[subj.subject_id]
                            const configured = rule && rule.periods_per_week > 0
                            const enabled = rule ? rule.enabled !== false : true
                            return (
                              <tr key={subj.subject_id} className={`border-t border-blue-100 hover:bg-blue-50/40 transition-opacity ${enabled ? '' : 'opacity-45'}`}>
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setRuleField(subj.subject_id, 'enabled', !enabled)}
                                      title={enabled ? 'Loại môn này khỏi lịch tự động' : 'Cho phép môn này trở lại'}
                                      className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all duration-150 select-none shadow-sm hover:scale-110 active:scale-95 ${
                                        enabled
                                          ? 'border-gray-200 bg-white text-gray-400 hover:border-red-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-rose-600 hover:shadow-md'
                                          : 'border-transparent bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[14px] font-extrabold leading-none">{enabled ? 'remove' : 'add'}</span>
                                    </button>
                                    <div>
                                      <div className="font-bold text-[#001d36]">{subj.subject_name}</div>
                                      <div className="text-[10px] text-gray-400">{subj.subject_code || ''}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <input
                                    type="number"
                                    min={0}
                                    max={12}
                                    value={rule?.periods_per_week ?? 0}
                                    onChange={(e) => setRuleField(subj.subject_id, 'periods_per_week', Number(e.target.value))}
                                    className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/40 bg-white text-gray-900"
                                  />
                                </td>
                                <td className="p-2 text-center">
                                  <select
                                    value={rule?.session ?? 'any'}
                                    onChange={(e) => setRuleField(subj.subject_id, 'session', e.target.value as ScheduleRule['session'])}
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/40 text-xs text-gray-900"
                                  >
                                    <option value="any">Cả 2 buổi</option>
                                    <option value="morning">Buổi sáng</option>
                                    <option value="afternoon">Buổi chiều</option>
                                  </select>
                                </td>
                                <td className="p-2 text-center">
                                  <select
                                    value={rule?.double_period ?? 1}
                                    onChange={(e) => setRuleField(subj.subject_id, 'double_period', Number(e.target.value))}
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/40 text-xs text-gray-900"
                                  >
                                    <option value={1}>1 tiết</option>
                                    <option value={2}>2 tiết liền</option>
                                    <option value={3}>3 tiết liền</option>
                                  </select>
                                </td>
                                <td className="p-2 text-left">
                                  <select
                                    value={rule?.teacher_id ?? ''}
                                    onChange={(e) => setRuleField(subj.subject_id, 'teacher_id', e.target.value ? Number(e.target.value) : null)}
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/40 text-xs w-full text-gray-900"
                                  >
                                    <option value="">Tự động</option>
                                    {teachersList
                                      .filter((t) => Number(t.subject_id) === Number(subj.subject_id) || t.teacher_id === (rule?.teacher_id ?? -1))
                                      .map((t) => (
                                        <option key={t.teacher_id} value={t.teacher_id}>{t.full_name}</option>
                                      ))}
                                  </select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-gray-500">
                        {configuredCount} môn đã cấu hình · {autoScope === 'all' ? classes.length : gradeFilteredClasses.length} lớp sẽ được xếp
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setScheduleRules({})}
                          disabled={savingRules}
                          className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Đặt lại
                        </button>
                        <button
                          onClick={handleSaveRules}
                          disabled={savingRules || !rulesLoaded}
                          className="px-4 py-2 bg-[#003366] hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-60 shadow-sm flex items-center gap-1.5"
                        >
                          {savingRules ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[14px]">save</span>
                              Lưu quy tắc
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-xl border border-blue-200 bg-white/60">
                    <div className="flex items-center gap-2 text-[#003366] mb-2">
                      <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider">Buổi Học Trong Tuần (Buổi Sáng)</h3>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                      Trong tuần sẽ có <strong>{days3 || 0} ngày 3 tiết</strong> và <strong>{days4 || 0} ngày 4 tiết</strong> vào buổi sáng. Nếu tổng tiết các môn nhiều hơn chỗ trống buổi sáng, phần dư sẽ tự dồn xuống buổi chiều cho đủ. Để trống (0) nếu muốn hệ thống tự sắp như trước.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-gray-700">
                        <span className="font-semibold w-28">Ngày 3 tiết</span>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          value={days3}
                          onChange={(e) => setDays3(Math.max(0, Number(e.target.value)))}
                          className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/40 text-gray-900"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-gray-700">
                        <span className="font-semibold w-28">Ngày 4 tiết</span>
                        <input
                          type="number"
                          min={0}
                          max={6}
                          value={days4}
                          onChange={(e) => setDays4(Math.max(0, Number(e.target.value)))}
                          className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003366]/40 text-gray-900"
                        />
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Chỗ buổi sáng: {3 * (days3 || 0) + 4 * (days4 || 0)} tiết / tuần
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5">
                    <div>
                      <div className="flex items-center gap-2 text-amber-900 mb-3">
                        <span className="material-symbols-outlined text-[24px] text-amber-600">warning</span>
                        <h3 className="text-sm font-bold uppercase tracking-wider">Cảnh Báo &amp; Xác Nhận</h3>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Thao tác này sẽ xếp lịch cho <strong>{autoScope === 'all' ? 'toàn trường' : selectedGrade}</strong> ({autoScope === 'all' ? classes.length : gradeFilteredClasses.length} lớp) cho học kỳ <strong>{autoAllSemesters ? 'Cả 2 học kì' : (semesters.find((s: any) => Number(s.semester_id) === Number(autoSemesterId ?? selectedSemesterId))?.semester_name ?? 'đã chọn')}</strong>.
                      </p>
                      <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
                        ⚠️ Lịch học hiện tại của các lớp được chọn sẽ bị xóa và tạo lại.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center shadow-xs">
                    <span className="material-symbols-outlined text-emerald-500 text-[48px]">check_circle</span>
                    <p className="text-lg font-extrabold text-emerald-900 mt-2">Đã Sắp Xếp Thời Khóa Biểu Thành Công!</p>
                    <p className="text-xs text-emerald-700 font-medium mt-1">Toàn bộ các lớp đã được phân công thời khóa biểu hợp lệ và không trùng giờ dạy.</p>
                    <div className="flex justify-center gap-8 mt-5">
                      <div className="text-center px-4">
                        <p className="text-3xl font-black text-[#001d36]">{autoResult.totalClasses}</p>
                        <p className="text-[11px] text-gray-500 uppercase font-bold mt-0.5">Lớp đã xếp</p>
                      </div>
                      <div className="w-px bg-emerald-200" />
                      <div className="text-center px-4">
                        <p className="text-3xl font-black text-[#001d36]">{autoResult.totalWeeks ?? 1}</p>
                        <p className="text-[11px] text-gray-500 uppercase font-bold mt-0.5">Tuần đã xếp (lặp lại)</p>
                      </div>
                      <div className="w-px bg-emerald-200" />
                      <div className="text-center px-4">
                        <p className="text-3xl font-black text-[#001d36]">{autoResult.teacherStats.length}</p>
                        <p className="text-[11px] text-gray-500 uppercase font-bold mt-0.5">Giáo viên phân công</p>
                      </div>
                    </div>
                  </div>

                  {autoResult.teacherStats.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Danh Sách Phân Công Giáo Viên (Tối đa 3 lớp/GV):</span>
                        <span className="text-[11px] font-normal text-gray-500">Tổng: {autoResult.teacherStats.length} GV</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto p-1 bg-gray-50/50 rounded-xl border border-gray-200">
                        {autoResult.teacherStats.map((stat, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 shadow-xs">
                            <span className="text-xs font-bold text-[#001d36] truncate mr-2">{stat.teacher_name}</span>
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md shrink-0 ${stat.classCount >= 3 ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                              {stat.classCount}/3 lớp
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => { setAutoModalOpen(false); setAutoResult(null) }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {autoResult ? 'Đóng' : 'Hủy'}
              </button>
              {!autoResult && (
                <button
                  onClick={handleAutoScheduleAllClasses}
                  disabled={autoScheduling}
                  className="px-6 py-2 bg-gradient-to-r from-[#003366] to-[#0066cc] hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-60 cursor-pointer shadow-md flex items-center gap-2"
                >
                  {autoScheduling ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      <span>Đang sắp xếp...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      <span>Bắt đầu sắp xếp</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Xác nhận xóa TKB toàn khối modal ── */}
      {mounted && confirmClearGrade && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-red-600 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-wide">Xóa Thời Khóa Biểu Toàn Khối</h2>
                  <p className="text-[11px] opacity-80">Hành động không thể hoàn tác</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmClearGrade(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Bạn muốn xóa <b>thời khóa biểu (tiết học thường)</b> của <b>{selectedGrade}</b> ở phạm vi nào?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setClearScope('week')}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${clearScope === 'week' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="material-symbols-outlined text-[20px] text-red-500">calendar_view_week</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${clearScope === 'week' ? 'border-red-500' : 'border-gray-300'}`}>
                      {clearScope === 'week' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-2.5">Tuần hiện tại</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Xóa lịch của tuần đang xem ở học kỳ hiện tại</p>
                </button>

                <button
                  onClick={() => setClearScope('hk1')}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${clearScope === 'hk1' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="material-symbols-outlined text-[20px] text-red-500">looks_one</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${clearScope === 'hk1' ? 'border-red-500' : 'border-gray-300'}`}>
                      {clearScope === 'hk1' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-2.5">Học kỳ I</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Xóa toàn bộ lịch của học kỳ 1 (mọi tuần)</p>
                </button>

                <button
                  onClick={() => setClearScope('hk2')}
                  className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${clearScope === 'hk2' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="material-symbols-outlined text-[20px] text-red-500">looks_two</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${clearScope === 'hk2' ? 'border-red-500' : 'border-gray-300'}`}>
                      {clearScope === 'hk2' && <div className="w-2 h-2 rounded-full bg-red-500" />}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-800 mt-2.5">Học kỳ II</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Xóa toàn bộ lịch của học kỳ 2 (mọi tuần)</p>
                </button>
              </div>

              <p className="text-[11px] text-gray-400 mt-4">Lịch thi (THI) không bị ảnh hưởng.</p>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setConfirmClearGrade(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleClearGrade}
                  disabled={clearingGrade}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {clearingGrade ? 'Đang xóa...' : 'Xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Phòng học management modal ── */}
      {mounted && roomsModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={() => setRoomsModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#003366] rounded-t-2xl">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[22px]">door_sliding</span>
                <h3 className="text-sm font-bold uppercase tracking-wider">Quản lý phòng học</h3>
              </div>
              <button onClick={() => setRoomsModalOpen(false)} className="text-white/80 hover:text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-5">
              <div className="text-xs text-gray-600">
                Đang quản lý phòng cho lớp <strong className="text-[#003366]">{selectedGrade}</strong>.
                Tích chọn các phòng áp dụng cho lớp này và chọn phòng cố định hiển thị trong thời khóa biểu.
              </div>

              {/* Add / edit room form */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-700 mb-3">{roomForm.room_id ? 'Sửa phòng' : 'Thêm phòng mới'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    value={roomForm.room_name}
                    onChange={(e) => setRoomForm((f) => ({ ...f, room_name: e.target.value }))}
                    placeholder="Tên phòng (VD: P.103)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/40 bg-white"
                  />
                  <input
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm((f) => ({ ...f, room_type: e.target.value }))}
                    placeholder="Loại phòng (Phòng học, Lab...)"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003366]/40 bg-white"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={handleSaveRoomForm} className="px-3 py-2 bg-[#003366] hover:opacity-90 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors">
                    {roomForm.room_id ? 'Lưu thay đổi' : 'Thêm phòng'}
                  </button>
                  {roomForm.room_id && (
                    <button onClick={() => setRoomForm({ room_name: '', room_type: '' })} className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                      Hủy sửa
                    </button>
                  )}
                </div>
              </div>

              {/* Room list with assignment checkboxes + fixed room */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-700">
                  Danh sách phòng ({allRooms.length})
                </div>
                <div className="max-h-[240px] overflow-y-auto divide-y divide-gray-100">
                  {allRooms.map((room) => (
                    <div key={room.room_id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={assignedRoomIds.includes(room.room_id)}
                        onChange={(e) =>
                          setAssignedRoomIds((prev) => e.target.checked ? [...prev, room.room_id] : prev.filter((id) => id !== room.room_id))
                        }
                        className="accent-[#003366]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#001d36] truncate">{room.room_name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{room.room_type || '—'}</p>
                        {roomOwnerMap[room.room_id]?.length > 0 && (
                          <p className="text-[10px] text-amber-600 font-semibold truncate">
                            {roomOwnerMap[room.room_id].join(', ')} đang học
                          </p>
                        )}
                      </div>
                      <label className="flex items-center gap-1 text-[10px] text-gray-600 shrink-0">
                        <input
                          type="radio"
                          name="fixedRoom"
                          checked={fixedRoomId === room.room_id}
                          onChange={() => setFixedRoomId(room.room_id)}
                          className="accent-[#003366]"
                        />
                        Phòng cố định
                      </label>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setRoomForm({ room_id: room.room_id, room_name: room.room_name, room_type: room.room_type || '' })}
                          className="p-1.5 text-gray-500 hover:text-[#003366] rounded-lg hover:bg-gray-100 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => handleDeleteRoom(room.room_id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {allRooms.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">Chưa có phòng nào. Thêm phòng mới ở trên.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setRoomsModalOpen(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                Hủy
              </button>
              <button onClick={handleSaveClassRooms} disabled={savingRooms} className="px-4 py-2 bg-[#003366] hover:opacity-90 text-white rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5">
                {savingRooms ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu phòng cho lớp'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
