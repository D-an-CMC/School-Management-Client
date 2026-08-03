'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getClasses, getSubjects, getTimetables, createTimetable, deleteTimetable, getTeachers, bulkCreateTimetables, getSemesters } from '@/lib/api'
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
  teacher_name?: string
  teachers?: any
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
  const [mounted, setMounted] = useState<boolean>(false)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<DbSubject[]>(DEFAULT_SUBJECTS)
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [selectedGrade, setSelectedGrade] = useState<string>('Khối 6')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(1)
  const [selectedRoom, setSelectedRoom] = useState<string>('Tất cả phòng')
  const [semesters, setSemesters] = useState<any[]>([])
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(1)
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

  // Auto Schedule Modal State
  const [autoModalOpen, setAutoModalOpen] = useState<boolean>(false)
  const [autoScope, setAutoScope] = useState<'all' | 'selectedGrade'>('all')
  const [autoScheduling, setAutoScheduling] = useState<boolean>(false)
  const [autoResult, setAutoResult] = useState<{
    totalClasses: number
    totalEntries: number
    teacherStats: Array<{ teacher_name: string; classCount: number }>
  } | null>(null)

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

  async function handleAssignTeacherToEntry(teacherId: number, teacherName: string) {
    if (!activeEntry || !activeCell) return
    setSaving(true)
    try {
      const dayIdx = activeCell.dayIdx
      const periodNo = activeCell.periodNo
      const targetClassId = selectedClassId || activeEntry.class_id || 1

      const result = await createTimetable({
        classId: targetClassId,
        subjectId: activeEntry.subject_id,
        teacherId,
        semesterId: selectedSemesterId || 1,
        dayOfWeek: frontDayToServer(dayIdx),
        periodNo,
      })

      if (result.success) {
        setEntries((prev) =>
          prev.map((e) =>
            e.schedule_id === activeEntry.schedule_id ||
            (serverDayToFront(e.day_of_week) === dayIdx && e.period_no === periodNo)
              ? { ...e, teacher_id: teacherId, teachers: { teacher_id: teacherId, full_name: teacherName }, teacher_name: teacherName }
              : e
          )
        )
        setShowTeacherPicker(false)
        setModalOpen(false)
      } else {
        alert('Lỗi khi gán giáo viên: ' + (result.error || 'Lỗi cơ sở dữ liệu'))
      }
    } catch (err) {
      console.error('Assign teacher error:', err)
      alert('Đã xảy ra lỗi khi gán giáo viên.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAutoScheduleAllClasses() {
    setAutoScheduling(true)
    setAutoResult(null)
    try {
      const [classRes, teacherRes, subjectRes] = await Promise.all([
        getClasses({ limit: 100 }).catch(() => null),
        getTeachers({ limit: 100 }).catch(() => null),
        getSubjects().catch(() => null),
      ])

      let rawClasses = classRes?.data && classRes.data.length > 0 ? classRes.data : classes
      const teacherList = teacherRes?.data && teacherRes.data.length > 0 ? teacherRes.data : []
      const subjectList: DbSubject[] = Array.isArray(subjectRes) && subjectRes.length > 0 ? subjectRes : subjects

      // Filter target classes by scope
      if (autoScope === 'selectedGrade') {
        const gradeNum = Number(selectedGrade.replace(/\D/g, '')) || 6
        rawClasses = rawClasses.filter((c: any) =>
          c.grade_level === gradeNum || c.class_name?.startsWith(String(gradeNum))
        )
      }

      const classList = rawClasses
      if (classList.length === 0) {
        alert('Không tìm thấy lớp học nào thuộc khối này để xếp thời khóa biểu!')
        setAutoScheduling(false)
        return
      }

      const normalizeText = (str: string) =>
        (str || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')

      // Fixed special subjects
      const ccSubj = subjectList.find(
        (s) => s.subject_code === 'CC' || normalizeText(s.subject_name).includes('chao co')
      ) || subjectList[0]
      const shSubj = subjectList.find(
        (s) => s.subject_code === 'SH' || normalizeText(s.subject_name).includes('sinh hoat')
      ) || subjectList[0]

      // Regular subjects (exclude CC & SH)
      const regularSubjs = subjectList.filter(
        (s) => s.subject_id !== ccSubj.subject_id && s.subject_id !== shSubj.subject_id
      )
      const fallbackSubj = regularSubjs.find(s => normalizeText(s.subject_name).includes('toan')) || regularSubjs[0] || subjectList[0]

      // Build base 28-slot template from regular subjects
      const baseSlotPool: DbSubject[] = []
      regularSubjs.forEach((subj) => {
        const normName = normalizeText(subj.subject_name || '')
        let count = 2
        if (normName.includes('toan')) count = 5
        else if (normName.includes('van') || normName.includes('ngu van')) count = 5
        else if (normName.includes('anh') || normName.includes('english')) count = 4
        else if (normName.includes('ly') || normName.includes('khtn')) count = 2
        else if (normName.includes('hoa') || normName.includes('sinh')) count = 2
        else if (normName.includes('su') || normName.includes('dia')) count = 2
        else if (normName.includes('tin') || normName.includes('the duc')) count = 2
        else count = 1
        for (let k = 0; k < count; k++) baseSlotPool.push(subj)
      })
      while (baseSlotPool.length < 28) baseSlotPool.push(fallbackSubj)
      const template28 = baseSlotPool.slice(0, 28) // This is the master template for class[0]

      // Seeded Fisher-Yates shuffle — same seed = same result, different seed = different layout
      const shuffleWithSeed = (arr: DbSubject[], seed: number): DbSubject[] => {
        const result = [...arr]
        let s = seed
        for (let i = result.length - 1; i > 0; i--) {
          s = (s * 1664525 + 1013904223) & 0x7fffffff
          const j = s % (i + 1)
          ;[result[i], result[j]] = [result[j], result[i]]
        }
        return result
      }

      // Group classes by grade so each grade uses the SAME 28 base subjects but UNIQUE slot ordering
      const gradeGroups = new Map<number, typeof classList>()
      for (const cls of classList) {
        const g = cls.grade_level || parseInt(cls.class_name?.[0] || '6')
        if (!gradeGroups.has(g)) gradeGroups.set(g, [])
        gradeGroups.get(g)!.push(cls)
      }

      // Teacher tracking: max 3 classes per teacher, no overlap
      const teacherClassMap = new Map<number, Set<number>>()
      const teacherOccupied = new Set<string>()
      const generatedEntries: any[] = []

      for (const [, gradeClasses] of gradeGroups) {
        for (let cIdx = 0; cIdx < gradeClasses.length; cIdx++) {
          const cls = gradeClasses[cIdx]
          const classId = cls.class_id

          // Available slots (Mon-Sat, periods 1-5; skip Mon P1 and Sat P5)
          const availableSlots: { day: string; period: number }[] = []
          for (let d = 2; d <= 7; d++) {
            for (let p = 1; p <= 5; p++) {
              if ((d === 2 && p === 1) || (d === 7 && p === 5)) continue
              availableSlots.push({ day: String(d), period: p })
            }
          }

          // Fixed: Chào cờ (Mon P1)
          generatedEntries.push({
            classId, subjectId: ccSubj.subject_id, semesterId: 1,
            dayOfWeek: '2', periodNo: 1, room: cls.class_name || 'Sân trường',
          })
          // Fixed: Sinh hoạt (Sat P5)
          generatedEntries.push({
            classId, subjectId: shSubj.subject_id, semesterId: 1,
            teacherId: cls.homeroom_teacher_id || undefined,
            dayOfWeek: '7', periodNo: 5, room: cls.class_name || 'Phòng học',
          })

          // For class[0] of each grade: use template28 directly (canonical order)
          // For class[1+]: shuffle with seed = classId so each class has a unique layout
          const classSubjOrder = cIdx === 0
            ? template28
            : shuffleWithSeed(template28, classId * 31 + cIdx * 17)

          for (let sIdx = 0; sIdx < availableSlots.length; sIdx++) {
            const slot = availableSlots[sIdx]
            const subj = classSubjOrder[sIdx] || fallbackSubj

            // Assign teacher: prefer matching by subject, respect max-3-class & no-overlap rules
            let assignedTeacherId: number | undefined = undefined
            if (teacherList.length > 0) {
              const normSubName = normalizeText(subj.subject_name || '')
              const matchPool = teacherList.filter((t: any) =>
                normalizeText(t.subject || t.department || '').includes(normSubName) ||
                normSubName.includes(normalizeText(t.department || ''))
              )
              const pool = matchPool.length > 0 ? matchPool : teacherList
              for (const t of pool) {
                const tId = t.teacher_id
                const occKey = `${tId}-${slot.day}-${slot.period}`
                const curClasses = teacherClassMap.get(tId) || new Set<number>()
                if (!teacherOccupied.has(occKey) && (curClasses.size < 3 || curClasses.has(classId))) {
                  assignedTeacherId = tId
                  curClasses.add(classId)
                  teacherClassMap.set(tId, curClasses)
                  teacherOccupied.add(occKey)
                  break
                }
              }
            }

            generatedEntries.push({
              classId, subjectId: subj.subject_id,
              teacherId: assignedTeacherId, semesterId: 1,
              dayOfWeek: slot.day, periodNo: slot.period,
              room: `P.${100 + (cIdx % 10) + 1}`,
            })
          }
        }
      }

      const bulkRes = await bulkCreateTimetables(generatedEntries)
      if (!bulkRes.success) {
        alert(`Lỗi khi lưu thời khóa biểu vào CSDL: ${bulkRes.error || 'Lỗi cơ sở dữ liệu'}`)
        setAutoScheduling(false)
        return
      }

      const teacherStats: Array<{ teacher_name: string; classCount: number }> = []
      teacherClassMap.forEach((classesSet, teacherId) => {
        const tObj = teacherList.find((t: any) => t.teacher_id === teacherId)
        if (tObj) teacherStats.push({ teacher_name: tObj.full_name, classCount: classesSet.size })
      })

      setAutoResult({
        totalClasses: classList.length,
        totalEntries: generatedEntries.length,
        teacherStats,
      })

      // Reload timetable for current class
      const targetClassId = selectedClassId || (classList.length > 0 ? classList[0].class_id : null)
      if (targetClassId) {
        if (!selectedClassId) setSelectedClassId(targetClassId)
        const res = await getTimetables({ classId: targetClassId, limit: 100 })
        if (res?.data) setEntries(res.data)
      }
    } catch (err) {
      console.error('Auto schedule error:', err)
      alert('Đã xảy ra lỗi khi tự động sắp xếp thời khóa biểu.')
    } finally {
      setAutoScheduling(false)
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Initial Fetching
  useEffect(() => {
    async function initData() {
      setLoading(true)
      try {
        const [clsRes, subjRes, semRes] = await Promise.all([getClasses(), getSubjects(), getSemesters()])
        const clsList = clsRes.success ? (clsRes.data ?? []) : []
        setClasses(clsList)

        if (subjRes && subjRes.length > 0) {
          setSubjects(subjRes)
        } else {
          setSubjects(DEFAULT_SUBJECTS)
        }

        const semList = Array.isArray(semRes) ? semRes : []
        setSemesters(semList)
        if (semList.length > 0) {
          const active = semList.find((s: any) => s.is_active) || semList[0]
          if (active) setSelectedSemesterId(active.semester_id)
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

  // 2. Fetch Timetable Entries when Class or Semester changes
  useEffect(() => {
    if (!selectedClassId) return

    async function loadTimetable() {
      setLoadingGrid(true)
      try {
        const res = await getTimetables({ classId: selectedClassId ?? undefined, semesterId: selectedSemesterId ?? undefined })
        const raw = res.data ?? []
        setEntries(raw)
      } catch (err) {
        console.error('Failed to load timetable:', err)
      } finally {
        setLoadingGrid(false)
      }
    }
    loadTimetable()
  }, [selectedClassId, selectedSemesterId])

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
  }, [selectedGrade])

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

  // ── Dynamic stats computed from real data ──────────────────
  const totalPeriods = entries.length  // periods scheduled for current class
  const totalSlotsInWeek = 28
  const coveragePct = totalSlotsInWeek > 0 ? Math.round((Math.min(totalPeriods, totalSlotsInWeek) / totalSlotsInWeek) * 100) : 0
  const scheduledClassCount = filteredClasses.length > 0 ? filteredClasses.length : classes.length

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)

  function getEntry(dayIdx: number, periodNo: number): TimetableEntry | undefined {
    return entries.find((e) => {
      const d = serverDayToFront(String(e.day_of_week))
      const p = Number(e.period_no ?? 1)
      return d === dayIdx && p === periodNo
    })
  }

  function getSubjectForEntry(entry: TimetableEntry | undefined): DbSubject | undefined {
    if (!entry) return undefined
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

  const displaySubjects = subjects.length > 0 ? subjects : DEFAULT_SUBJECTS

  // Dynamic N-period streak calculation for merging 2, 3, 4... consecutive periods
  function getConsecutiveStreakInfo(
    dayIdx: number,
    periodNo: number,
    sessionSlots: { period: number }[]
  ) {
    const current = getEntry(dayIdx, periodNo)
    const currentSubj = getSubjectForEntry(current)?.subject_id

    if (!currentSubj) {
      return { isStart: true, streakLength: 1, isChild: false }
    }

    const sessionStartPeriod = sessionSlots[0].period
    const sessionEndPeriod = sessionSlots[sessionSlots.length - 1].period

    const prevEntry = periodNo > sessionStartPeriod ? getEntry(dayIdx, periodNo - 1) : undefined
    const prevSubj = getSubjectForEntry(prevEntry)?.subject_id

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
    setShowTeacherPicker(false)
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
        semesterId: selectedSemesterId || 1,
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

  async function handleAssignCustomSubject() {
    if (!customSubjectName.trim() || !activeCell) return
    setSaving(true)
    try {
      const dayIdx = activeCell.dayIdx
      const periodNo = activeCell.periodNo
      const targetClassId = selectedClassId || 1
      const name = customSubjectName.trim()
      const teacher = customTeacherName.trim()

      const existingSubj = displaySubjects.find((s) => s.subject_name?.toLowerCase() === name.toLowerCase())
      const subjectId = existingSubj ? existingSubj.subject_id : (displaySubjects.find(s => s.subject_name !== 'Chào cờ')?.subject_id || displaySubjects[0]?.subject_id || 1)

      const result = await createTimetable({
        classId: targetClassId,
        subjectId,
        semesterId: selectedSemesterId || 1,
        dayOfWeek: frontDayToServer(dayIdx),
        periodNo,
      })

      const customSubjObj: DbSubject = {
        subject_id: subjectId,
        subject_code: existingSubj?.subject_code || 'TDK',
        subject_name: name,
      }

      const newEntry: TimetableEntry = {
        schedule_id: result.success ? result.data?.[0]?.schedule_id || Date.now() : Date.now(),
        class_id: targetClassId,
        subject_id: subjectId,
        day_of_week: frontDayToServer(dayIdx),
        period_no: periodNo,
        subjects: customSubjObj,
        teacher_name: teacher || undefined,
        teachers: teacher ? { teacher_id: 0, full_name: teacher } : undefined,
      }

      setEntries((prev) => [
        ...prev.filter(
          (e) => !(serverDayToFront(e.day_of_week) === dayIdx && e.period_no === periodNo)
        ),
        newEntry,
      ])

      setCustomSubjectName('')
      setCustomTeacherName('')
      setModalOpen(false)
      setQuickModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Đã xảy ra lỗi khi gán môn tự đăng ký.')
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
              value={selectedSemesterId ?? ''}
              onChange={(e) => setSelectedSemesterId(Number(e.target.value))}
              className="bg-gray-50 border border-gray-500 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#003366]"
            >
              {semesters.map((s: any) => {
                const yr = s.school_year?.year_name ? ` - ${s.school_year.year_name}` : ''
                return (
                  <option key={s.semester_id} value={s.semester_id}>
                    {s.semester_name}{yr}
                  </option>
                )
              })}
              {semesters.length === 0 && <option value={1}>Học kỳ I - 2023-2024</option>}
            </select>
          </div>

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
              {filteredClasses.length === 0 && <option value="1">Lớp 6A1 (Mặc định)</option>}
            </select>
          </div>

          {/* Phòng học */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phòng học</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#003366]"
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
                    const teacherName = (entry as any)?.teachers?.full_name || (entry as any)?.teacher_name || (Array.isArray((entry as any)?.teachers) ? (entry as any)?.teachers[0]?.full_name : null) || 'Chưa phân công'

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
                          className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isMulti && (
                                  <span className="text-[10px] font-bold block mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                                    Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                                {subject.subject_code || 'MON'}
                              </span>
                            </div>
                            <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                              <span className="truncate">GV: {teacherName}</span>
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
                    const subject = getSubjectForEntry(entry)
                    const theme = subject ? getSubjectTheme(subject.subject_id) : null
                    const teacherName = (entry as any)?.teachers?.full_name || (entry as any)?.teacher_name || (Array.isArray((entry as any)?.teachers) ? (entry as any)?.teachers[0]?.full_name : null) || 'Chưa phân công'

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
                            className={`h-full w-full rounded-lg border ${theme?.bg} p-2.5 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className={`${titleFontSize} leading-tight block`}>{subject.subject_name}</span>
                                {isMulti && (
                                  <span className="text-[10px] font-bold block mt-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full w-fit">
                                    Tiết {slot.period} - {slot.period + streakLen - 1} ({streakLen} tiết liền)
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${theme?.tag}`}>
                                {subject.subject_code || 'MON'}
                              </span>
                            </div>
                            <div className="flex justify-between items-end text-[10px] opacity-80 mt-1">
                              <span className="truncate">GV: {teacherName}</span>
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
                              {qualifiedTeachers.map((t: any) => (
                                <div
                                  key={t.teacher_id}
                                  onClick={() => handleAssignTeacherToEntry(t.teacher_id, t.full_name)}
                                  className="p-2 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                  <div>
                                    <span className="text-xs font-bold text-gray-900 block">{t.full_name}</span>
                                    <span className="text-[10px] text-gray-500">Bộ môn: {t.department || 'Chung'} | Mã: {t.teacher_code || `GV${t.teacher_id}`}</span>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[#003366] mb-3">
                          <span className="material-symbols-outlined text-[24px]">verified</span>
                          <h3 className="text-sm font-bold uppercase tracking-wider">Quy Tắc &amp; Ràng Buộc</h3>
                        </div>
                        <ul className="text-xs text-gray-700 space-y-2.5">
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                            <span><strong>Phân bổ đầy đủ:</strong> Tất cả các môn trong CSDL đều được xếp vào thời khóa biểu.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                            <span><strong>Không lớp nào giống nhau:</strong> Mỗi lớp có thứ tự môn học riêng biệt (seeded shuffle theo class ID).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                            <span><strong>Ràng buộc GV:</strong> Mỗi giáo viên dạy tối đa 3 lớp, không trùng tiết.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-[16px] shrink-0 mt-0.5">check_circle</span>
                            <span><strong>Tiết cố định:</strong> Thứ 2 Tiết 1 (Chào cờ), Thứ 7 Tiết 5 (Sinh hoạt lớp).</span>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-4 pt-3 border-t border-blue-200/60 text-xs text-blue-900 font-semibold flex items-center justify-between">
                        <span>Lớp sẽ được xếp:</span>
                        <span className="px-2.5 py-1 bg-white rounded-lg text-[#003366] font-bold border border-blue-200 shadow-xs">
                          {autoScope === 'all' ? classes.length : gradeFilteredClasses.length} Lớp học
                        </span>
                      </div>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-amber-900 mb-3">
                          <span className="material-symbols-outlined text-[24px] text-amber-600">warning</span>
                          <h3 className="text-sm font-bold uppercase tracking-wider">Cảnh Báo &amp; Xác Nhận</h3>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Thao tác này sẽ xếp lịch cho <strong>{autoScope === 'all' ? 'toàn trường' : selectedGrade}</strong> ({autoScope === 'all' ? classes.length : gradeFilteredClasses.length} lớp).
                        </p>
                        <div className="mt-3 p-3 bg-white/80 rounded-lg border border-amber-200 text-xs text-amber-900 font-medium">
                          ⚠️ Lịch học hiện tại của các lớp được chọn sẽ bị xóa và tạo lại.
                        </div>
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
                        <p className="text-3xl font-black text-[#001d36]">{autoResult.totalEntries}</p>
                        <p className="text-[11px] text-gray-500 uppercase font-bold mt-0.5">Tổng số tiết học</p>
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
    </div>
  )
}
