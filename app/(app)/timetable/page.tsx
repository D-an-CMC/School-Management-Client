'use client'

import React, { useState, useEffect } from 'react'
import { useMediaQuery } from '@/lib/use-media-query'
import { getClasses, getSubjects, getTimetables, createTimetable, deleteTimetable } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

interface DbSubject { subject_id: number; subject_code: string; subject_name: string }
interface TimetableEntry { schedule_id: number; class_id: number; subject_id: number; day_of_week: string; period_no?: number; room?: string }

interface CellData {
  day: number
  period: number
  session: 'morning' | 'afternoon'
  entry?: TimetableEntry
  subj?: { name: string; emoji?: string; time: string; room: string }
}

// ──────────────────────────────────────────────────────
// Color palette — deterministic by subject_id
// ──────────────────────────────────────────────────────

const PALETTE = [
  { bg: '#f9abff', text: '#591389' },
  { bg: '#bbc3ff', text: '#1B2B8A' },
  { bg: '#ed76fd', text: '#ffffff' },
  { bg: '#3d5afe', text: '#ffffff' },
  { bg: '#FFE082', text: '#5D4037' },
  { bg: '#BDBDBD', text: '#212121' },
  { bg: '#FF8A65', text: '#BF360C' },
  { bg: '#81C784', text: '#1B5E20' },
  { bg: '#4DD0E1', text: '#006064' },
  { bg: '#FFD54F', text: '#5D4037' },
  { bg: '#CE93D8', text: '#4A148C' },
  { bg: '#90CAF9', text: '#0D47A1' },
]

function colorFor(id: number) { return PALETTE[id % PALETTE.length] }

// ──────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────

// Frontend:  0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
// Server:    '2'=Mon '3'=Tue ... '7'=Sat '1'=Sun
function serverDayToFront(serverDay: string): number {
  const n = Number(serverDay)
  if (isNaN(n)) return 0
  return ((n - 2) % 7 + 7) % 7
}

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const PERIOD_COUNT = 5

const GRADE_OPTIONS = [
  { value: 6, label: 'Khối 6' },
  { value: 7, label: 'Khối 7' },
  { value: 8, label: 'Khối 8' },
  { value: 9, label: 'Khối 9' },
]

// ──────────────────────────────────────────────────────
// Static timetable (for OriginalPage / teacher-student)
// ──────────────────────────────────────────────────────

const STATIC_SUBJECTS: Record<string, { name: string; emoji?: string; time: string; room: string }> = {
  my_phuong: { name: 'Mỹ thuật',  emoji: '🎨', time: '08:00 - 08:45', room: 'P. 302' },
  ngoai_ngu: { name: 'Ngoại ngữ', emoji: '🌍', time: '08:00 - 08:45', room: 'P. 302' },
  ngu_van:   { name: 'Ngữ văn',  emoji: '📖', time: '13:00 - 13:45', room: 'P. 302' },
  toan_hoc:  { name: 'Toán học', emoji: '📐', time: '09:00 - 09:45', room: 'P. 302' },
  vat_ly:    { name: 'Vật lý',   emoji: '⚛️', time: '09:00 - 09:45', room: 'P. 302' },
  lich_su:   { name: 'Lịch sử',  emoji: '📜', time: '09:00 - 09:45', room: 'P. 302' },
}

function buildStaticTimetable(): CellData[] {
  const rows: { slot: CellData; key: string }[] = [
    { slot: { day: 0, period: 0, session: 'morning' },    key: 'my_phuong' },
    { slot: { day: 1, period: 0, session: 'morning' },    key: 'my_phuong' },
    { slot: { day: 2, period: 0, session: 'morning' },    key: 'my_phuong' },
    { slot: { day: 3, period: 0, session: 'morning' },    key: 'ngoai_ngu' },
    { slot: { day: 4, period: 0, session: 'morning' },    key: 'ngu_van' },
    { slot: { day: 0, period: 1, session: 'morning' },    key: 'my_phuong' },
    { slot: { day: 1, period: 1, session: 'morning' },    key: 'vat_ly' },
    { slot: { day: 2, period: 1, session: 'morning' },    key: 'lich_su' },
    { slot: { day: 3, period: 1, session: 'morning' },    key: 'my_phuong' },
    { slot: { day: 4, period: 1, session: 'morning' },    key: 'toan_hoc' },
    { slot: { day: 0, period: 0, session: 'afternoon' },  key: 'ngu_van' },
    { slot: { day: 1, period: 0, session: 'afternoon' },  key: 'ngoai_ngu' },
    { slot: { day: 2, period: 0, session: 'afternoon' },  key: 'lich_su' },
    { slot: { day: 3, period: 0, session: 'afternoon' },  key: 'ngoai_ngu' },
    { slot: { day: 4, period: 0, session: 'afternoon' },  key: 'ngoai_ngu' },
  ]
  return rows.map(({ slot, key }) => ({ ...slot, subj: STATIC_SUBJECTS[key] }))
}

const STATIC_CELLS = buildStaticTimetable()

// ──────────────────────────────────────────────────────
// Shared visual components
// ──────────────────────────────────────────────────────

function SubjectCard({ subject, subjTime, subjRoom }: { subject: DbSubject; subjTime?: string; subjRoom?: string }) {
  const { bg, text } = colorFor(subject.subject_id)
  return (
    <div
      className="h-full rounded-lg border-2 border-(--color-border) flex flex-col justify-between p-2 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:translate-x-[0.5px] hover:translate-y-[0.5px] hover:shadow-none"
      style={{ backgroundColor: bg, color: text }}
    >
      <h4 className="text-[13px] font-black leading-tight drop-shadow-sm">{subject.subject_name}</h4>
      {subjTime && <p className="text-[9px] opacity-80">{subjTime}</p>}
      {subjRoom && <p className="text-[9px] opacity-90">{subjRoom}</p>}
    </div>
  )
}

function EmptySlot() {
  return (
    <div className="h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 hover:border-primary hover:text-primary transition-all cursor-pointer">
      <span className="text-2xl font-bold text-gray-400">+</span>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// TimetableGrid (presentational, cells passed as prop)
// ──────────────────────────────────────────────────────

interface TimetableGridProps {
  cells: CellData[]
  subjects: DbSubject[]
  subjectLookup: Map<number, { time?: string; room?: string }>
  onCellClick?: (cell: CellData, subject?: DbSubject) => void
  onClickable?: boolean
}

function TimetableGrid({ cells, subjects, subjectLookup, onCellClick, onClickable }: TimetableGridProps) {
  const gridCol = '80px 60px repeat(7, minmax(90px, 1fr))'

  const lookupSubject = (id?: number) => subjects.find(s => s.subject_id === id)
  const lookupMeta = (id?: number) => subjectLookup.get(id ?? 0)

  const renderDayCell = (dIdx: number, pIdx: number, session: 'morning' | 'afternoon') => {
    const cell = cells.find(c => c.day === dIdx && c.period === pIdx && c.session === session)
    const subj = cell ? lookupSubject(cell.entry?.subject_id) : undefined
    const meta = subj ? lookupMeta(subj.subject_id) : undefined

    if (cell?.entry && subj) {
      return (
        <div
          className="p-1 border-b-2 border-r-2 border-(--color-border) min-h-[90px]"
          onClick={onClickable && onCellClick ? () => onCellClick(cell, subj) : undefined}
          role={onClickable ? 'button' : undefined}
          tabIndex={onClickable ? 0 : undefined}
        >
          <SubjectCard subject={subj} subjTime={meta?.time} subjRoom={meta?.room} />
        </div>
      )
    }
    return (
      <div
        className="p-1 border-b-2 border-r-2 border-(--color-border) min-h-[90px]"
        onClick={onClickable && onCellClick ? () => onCellClick(cell ?? { day: dIdx, period: pIdx, session }) : undefined}
        role={onClickable ? 'button' : undefined}
        tabIndex={onClickable ? 0 : undefined}
      >
        <EmptySlot />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-black">
      {/* Header row */}
      <div className="grid border-b-2 border-(--color-border) bg-gray-50" style={{ gridTemplateColumns: gridCol }}>
        <div className="p-2 font-bold text-[10px] text-gray-500 uppercase flex items-center justify-center border-r-2 border-(--color-border)">Buổi</div>
        <div className="p-2 font-bold text-[10px] text-gray-500 uppercase flex items-center justify-center border-r-2 border-(--color-border)">Tiết</div>
        {DAYS.map(d => (
          <div key={d} className="p-2 font-bold text-xs text-primary text-center border-r-2 border-(--color-border)">{d}</div>
        ))}
      </div>
      {/* Body grid */}
      <div className="grid" style={{ gridTemplateColumns: gridCol, gridTemplateRows: 'repeat(5, 1fr) 4px repeat(5, 1fr)' }}>
        {Array.from({ length: PERIOD_COUNT }, (_, pIdx) => (
          <React.Fragment key={'morning-' + pIdx}>
            {pIdx === 2 ? (
              <div className="border-r-2 border-(--color-border) bg-blue-50/30 flex flex-col items-center justify-center py-2 text-sm font-bold text-primary leading-tight">
                <span className="text-3xl leading-none">☀️</span>
                <span className="text-sm font-extrabold">SÁNG</span>
              </div>
            ) : <div className="border-r-2 border-(--color-border)" />}
            <div className="p-2 border-b-2 border-r-2 border-(--color-border) text-center font-bold text-xs flex items-center justify-center text-on-surface">Tiết {pIdx + 1}</div>
            {Array.from({ length: 7 }, (_, dIdx) => <div key={`mc-${dIdx}-${pIdx}`}>{renderDayCell(dIdx, pIdx, 'morning')}</div>)}
          </React.Fragment>
        ))}
        <div style={{ gridColumn: '1 / -1' }} className="h-[3px] bg-(--color-border)" />
        {Array.from({ length: PERIOD_COUNT }, (_, pIdx) => (
          <React.Fragment key={'afternoon-' + pIdx}>
            {pIdx === 2 ? (
              <div className="border-r-2 border-(--color-border) bg-purple-50/10 flex flex-col items-center justify-center py-2 text-sm font-bold text-secondary leading-tight">
                <span className="text-3xl leading-none">🌙</span>
                <span className="text-sm font-extrabold">CHIỀU</span>
              </div>
            ) : <div className="border-r-2 border-(--color-border)" />}
            <div className="p-2 border-b-2 border-r-2 border-(--color-border) text-center font-bold text-xs flex items-center justify-center text-on-surface">Tiết {pIdx + 6}</div>
            {Array.from({ length: 7 }, (_, dIdx) => <div key={`ac-${dIdx}-${pIdx}`}>{renderDayCell(dIdx, pIdx, 'afternoon')}</div>)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Subject Select Modal
// ──────────────────────────────────────────────────────

interface SubjectModalProps {
  subjects: DbSubject[]
  cell: CellData | null
  existingSubject?: DbSubject
  onSelect: (subjectId: number) => void
  onDelete: () => void
  onClose: () => void
}

function SubjectModal({ subjects, cell, existingSubject, onSelect, onDelete, onClose }: SubjectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl border-2 border-black w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-black text-on-surface">
              {existingSubject ? existingSubject.subject_name : 'Chọn môn học'}
            </h2>
            {cell && (
              <p className="text-sm text-gray-500 font-medium">
                {DAYS[cell.day]} — {cell.session === 'morning' ? `Tiết ${cell.period + 1}` : `Tiết ${cell.period + 6}`}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">×</button>
        </div>
        <div className="p-4 overflow-y-auto">
          {existingSubject && (
            <button
              onClick={() => { onDelete(); onClose() }}
              className="w-full mb-4 p-3 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <span>🗑️</span> Xóa môn học này
            </button>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map(subj => {
              const { bg, text } = colorFor(subj.subject_id)
              return (
                <button
                  key={subj.subject_id}
                  onClick={() => onSelect(subj.subject_id)}
                  className="rounded-xl p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none flex flex-col items-center gap-2"
                  style={{ backgroundColor: bg, color: text }}
                >
                  <span className="text-lg font-black text-center leading-tight">{subj.subject_name}</span>
                  {subj.subject_code && <span className="text-[10px] opacity-70 font-mono">{subj.subject_code}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// AdminGridView: fetch & display editable timetable grid
// ──────────────────────────────────────────────────────

interface AdminGridViewProps {
  selectedClass: any
  onBack: () => void
}

function AdminGridView({ selectedClass, onBack }: AdminGridViewProps) {
  const [subjects, setSubjects] = useState<DbSubject[]>([])
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [subjectMeta, setSubjectMeta] = useState<Map<number, { time?: string; room?: string }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalState, setModalState] = useState<{ open: boolean; action: 'add' | 'delete'; cell?: CellData; subject?: DbSubject; scheduleId?: number; entry?: TimetableEntry }>({ open: false, action: 'add' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [subjRes, ttRes] = await Promise.all([
        getSubjects(),
        getTimetables({ classId: selectedClass.class_id }),
      ])
      if (cancelled) return
      if (subjRes && subjRes.length > 0) setSubjects(subjRes)
  const raw = ttRes.data ?? []
  // Backend deduplicates—no frontend dedup needed
  setEntries(raw)

      // build meta map from subject data (time/room placeholders since API subjects lack these)
      const meta = new Map<number, { time?: string; room?: string }>()
      raw.forEach((e: any) => {
        const s = (e as any).subjects
        if (s?.subject_id) {
          meta.set(s.subject_id, { time: s.subject_code, room: s.subject_name })
        }
      })
      setSubjectMeta(meta)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [selectedClass.class_id])

// Build cells array for grid
const cells: CellData[] = entries.map(e => ({
  day: serverDayToFront(e.day_of_week),
  period: (e.period_no ?? 1) - 1,
  session: (e.period_no ?? 1) <= 5 ? 'morning' : 'afternoon',
  entry: e,
}))

const lookupSubject = (id?: number) => subjects.find(s => s.subject_id === id)

function openAddModal(cell: CellData) {
    setModalState({ open: true, action: 'add', cell })
  }

  function openDeleteModal(cell: CellData, subject: DbSubject) {
    const entry = cell.entry
    setModalState({ open: true, action: 'delete', cell, subject, scheduleId: entry?.schedule_id })
  }

  async function handleAddSubject(subjectId: number) {
    if (!modalState.cell) return
    const c = modalState.cell
    setSaving(true)
    const result = await createTimetable({
      classId: selectedClass.class_id,
      subjectId,
      semesterId: 1,
      dayOfWeek: String(c.day + 2),
      periodNo: c.period + (c.session === 'morning' ? 1 : 6),
    })
    setSaving(false)
    if (result.success) {
      const newEntry: TimetableEntry = {
        ...(result.data?.[0] ?? {}),
        class_id: selectedClass.class_id,
        subject_id: subjectId,
        day_of_week: String(c.day + 2),
        period_no: c.period + (c.session === 'morning' ? 1 : 6),
      }
      setEntries(prev => [...prev, newEntry])
      setModalState({ open: false, action: 'add' })
    } else {
      alert('Lỗi: ' + result.error)
    }
  }

  async function handleDelete() {
    if (!modalState.scheduleId) return
    setSaving(true)
    const result = await deleteTimetable(modalState.scheduleId)
    setSaving(false)
    if (result.success) {
      setEntries(prev => prev.filter(e => e.schedule_id !== modalState.scheduleId!))
    } else {
      alert('Lỗi: ' + result.error)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">← Chọn lớp khác</button>
        <div className="h-8 w-px bg-gray-200" />
        <h1 className="font-headline-lg text-primary font-extrabold tracking-tight text-primary-vibrant">THỜI KHÓA BIỂU</h1>
        <span className="text-sm font-bold text-gray-700">— {selectedClass.class_name}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <TimetableGrid
          cells={cells}
          subjects={subjects}
          subjectLookup={subjectMeta}
          onClickable
          onCellClick={(cell, subject) => {
            if (subject) {
              // has subject → delete option
              const entry = cell.entry
              setModalState({ open: true, action: 'delete', cell, subject, scheduleId: cell.entry?.schedule_id })
            } else {
              // empty → add subject
              setModalState({ open: true, action: 'add', cell })
            }
          }}
        />
      )}

      {saving && <p className="text-center text-sm text-gray-500 font-medium">Đang lưu...</p>}

      {modalState.open && (
        <SubjectModal
          subjects={subjects}
          cell={modalState.cell ?? null}
          existingSubject={modalState.subject}
          onSelect={handleAddSubject}
          onDelete={handleDelete}
          onClose={() => setModalState({ open: false, action: 'add' })}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Original page (teacher / student) — unchanged
// ──────────────────────────────────────────────────────

const TASKS = [
  { id: '1', title: 'Bản thảo bài Văn học (Thứ 4)', subject: 'Ngữ văn', dueLabel: '2 ngày còn lại', urgent: true, completed: false },
  { id: '2', title: 'Bài tập hình học chương 2', subject: 'Toán học', dueLabel: 'Đã xong', urgent: false, completed: true },
]

function OriginalPage() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const completedCount = TASKS.filter(t => t.completed).length
  const totalSlotCount = STATIC_CELLS.filter(c => c.subj !== undefined).length
  const progress = Math.round((completedCount / Math.max(totalSlotCount, 1)) * 100)

  const gridCol = '80px 60px repeat(7, minmax(90px, 1fr))'

  const subjectLookup = new Map<string, { time: string; room: string }>()
  Object.entries(STATIC_SUBJECTS).forEach(([k, v]) => subjectLookup.set(k, { time: v.time, room: v.room }))

  function renderDayCell(dIdx: number, pIdx: number, session: 'morning' | 'afternoon') {
    const cell = STATIC_CELLS.find(c => c.day === dIdx && c.period === pIdx && c.session === session)
    if (cell?.subj) {
      return (
        <div className="p-1 border-b-2 border-r-2 border-(--color-border) min-h-[90px]">
          <SubjectCardStatic subj={cell.subj} />
        </div>
      )
    }
    return (
      <div className="p-1 border-b-2 border-r-2 border-(--color-border) min-h-[90px]">
        <EmptySlot />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="font-headline-lg text-primary font-extrabold tracking-tight text-primary-vibrant">THỜI KHÓA BIỂU</h1>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Năm học</span>
              <span className="text-sm font-bold text-gray-700">2024 - 2025</span>
            </div>
          </div>
          <p className="text-sm text-primary font-bold uppercase tracking-widest mb-1">CHÀO BUỔI SÁNG, NAM!</p>
          <h2 className="text-2xl font-bold text-on-surface">Lịch học tuần này của bạn</h2>
        </div>
        <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 shadow-sm">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Kiểm tra sắp tới</p>
            <p className="text-sm font-bold text-on-surface">Toán học (Tiết 3)</p>
          </div>
        </div>
      </div>

      {/* Timetable grid */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-black">
        <div className="grid border-b-2 border-(--color-border) bg-gray-50" style={{ gridTemplateColumns: gridCol }}>
          <div className="p-2 font-bold text-[10px] text-gray-500 uppercase flex items-center justify-center border-r-2 border-(--color-border)">Buổi</div>
          <div className="p-2 font-bold text-[10px] text-gray-500 uppercase flex items-center justify-center border-r-2 border-(--color-border)">Tiết</div>
          {DAYS.map(d => <div key={d} className="p-2 font-bold text-xs text-primary text-center border-r-2 border-(--color-border)">{d}</div>)}
        </div>
        <div className="grid" style={{ gridTemplateColumns: gridCol, gridTemplateRows: 'repeat(5, 1fr) 4px repeat(5, 1fr)' }}>
          {Array.from({ length: PERIOD_COUNT }, (_, pIdx) => (
            <React.Fragment key={'morning-' + pIdx}>
              {pIdx === 2 ? (
                <div className="border-r-2 border-(--color-border) bg-blue-50/30 flex flex-col items-center justify-center py-2 text-sm font-bold text-primary leading-tight">
                  <span className="text-3xl leading-none">☀️</span>
                  <span className="text-sm font-extrabold">SÁNG</span>
                </div>
              ) : <div className="border-r-2 border-(--color-border)" />}
              <div className="p-2 border-b-2 border-r-2 border-(--color-border) text-center font-bold text-xs flex items-center justify-center text-on-surface">Tiết {pIdx + 1}</div>
              {Array.from({ length: 7 }, (_, dIdx) => <div key={`morning-${dIdx}-${pIdx}`}>{renderDayCell(dIdx, pIdx, 'morning')}</div>)}
            </React.Fragment>
          ))}
          <div style={{ gridColumn: '1 / -1' }} className="h-[3px] bg-(--color-border)" />
          {Array.from({ length: PERIOD_COUNT }, (_, pIdx) => (
            <React.Fragment key={'afternoon-' + pIdx}>
              {pIdx === 2 ? (
                <div className="border-r-2 border-(--color-border) bg-purple-50/10 flex flex-col items-center justify-center py-2 text-sm font-bold text-secondary leading-tight">
                  <span className="text-3xl leading-none">🌙</span>
                  <span className="text-sm font-extrabold">CHIỀU</span>
                </div>
              ) : <div className="border-r-2 border-(--color-border)" />}
              <div className="p-2 border-b-2 border-r-2 border-(--color-border) text-center font-bold text-xs flex items-center justify-center text-on-surface">Tiết {pIdx + 6}</div>
              {Array.from({ length: 7 }, (_, dIdx) => <div key={`afternoon-${dIdx}-${pIdx}`}>{renderDayCell(dIdx, pIdx, 'afternoon')}</div>)}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Tasks + Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black relative overflow-hidden">
          <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="text-primary text-xl">📋</span> Nhiệm vụ tuần này
            <span className="text-red-500 text-lg animate-pulse">🔴</span>
          </h3>
          <div className="space-y-3">
            {TASKS.map(task => (
              <div key={task.id} className={`flex items-center gap-4 p-4 border-2 border-black rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,1)] ${task.completed ? 'opacity-60 bg-gray-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <p className="font-bold text-gray-800">{task.title}</p>
                </div>
                <div className="flex flex-col items-end">
                  {task.urgent ? (
                    <><span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Khẩn cấp</span><span className="text-[10px] text-red-500 font-bold">{task.dueLabel}</span></>
                  ) : <span className="text-[10px] text-primary font-bold uppercase">{task.dueLabel}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)] border-2 border-black relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Tiến độ tuần</p>
            <h3 className="text-3xl font-extrabold mt-1">{progress}% Hoàn thành</h3>
          </div>
          <div className="mt-8">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden border border-white/30">
              <div className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 text-xs opacity-90 leading-relaxed font-medium">Bạn đã hoàn thành {completedCount}/{totalSlotCount} tiết học tuần này. Cố lên!</p>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 rotate-12"><span className="text-[100px] leading-none">🚀</span></div>
        </div>
      </div>

      {isMobile && (
        <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Chuyển ngày">
          {DAYS.map((d, i) => (
            <button key={d} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors ${i === 0 ? 'bg-primary text-white shadow-md' : 'bg-surface-container-high text-on-surface hover:bg-gray-200'}`}>{d}</button>
          ))}
        </nav>
      )}
    </div>
  )
}

// Static subject card (no bgColor prefix, uses palette)
function SubjectCardStatic({ subj }: { subj: { name: string; emoji?: string; time: string; room: string } }) {
  const idx = Math.abs(
    [...subj.name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % PALETTE.length
  const { bg, text } = PALETTE[idx]
  return (
    <div className="h-full rounded-lg border-2 border-(--color-border) flex flex-col justify-between p-2 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: bg, color: text }}>
      <h4 className="text-[15px] font-black leading-tight drop-shadow-sm">{subj.emoji} {subj.name}</h4>
      <p className="text-[10px] opacity-80">{subj.time}</p>
      <p className="text-[9px] opacity-90">{subj.room}</p>
    </div>
  )
}

// ──────────────────────────────────────────────────────
// AdminClassPicker (unchanged)
// ──────────────────────────────────────────────────────

function AdminClassPicker({ onSelect }: { onSelect: (cls: any) => void }) {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  useEffect(() => {
    getClasses().then(res => {
      if (res.success) setClasses(res.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>
  }

  const filtered = selectedGrade != null ? classes.filter((c: any) => c.grade_level === selectedGrade) : []

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="font-headline-lg text-primary font-extrabold tracking-tight text-primary-vibrant">THỜI KHÓA BIỂU</h1>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Chọn khối và lớp để xem thời khóa biểu</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {GRADE_OPTIONS.map(g => (
          <button key={g.value} onClick={() => setSelectedGrade(g.value)} className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedGrade === g.value ? 'bg-primary text-white border-primary shadow-md' : 'bg-white border-gray-200 hover:border-primary text-gray-700'}`}>
            {g.label}
          </button>
        ))}
      </div>
      {selectedGrade == null ? (
        <p className="text-gray-400 text-sm font-medium">Vui lòng chọn một khối ở trên</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 font-bold">Không có lớp nào trong khối này</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cls: any) => (
            <button key={cls.class_id} onClick={() => onSelect(cls)} className="group text-left p-5 rounded-2xl border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none bg-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">📚</span>
                <div>
                  <h3 className="font-extrabold text-lg text-black">{cls.class_name}</h3>
                  <span className="text-xs font-bold text-gray-500">{cls.grade_name ?? ''}</span>
                </div>
              </div>
              <div className="space-y-1 text-xs font-medium text-gray-600">
                {cls.homeroom_teacher_name && <p>GVCN: {cls.homeroom_teacher_name}</p>}
                <p>{cls.student_count ?? 0} học sinh</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────
// Entry point
// ──────────────────────────────────────────────────────

export default function TimetablePage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [selectedClass, setSelectedClass] = useState<any | null>(null)

  if (!isAdmin) return <OriginalPage />
  if (!selectedClass) return <AdminClassPicker onSelect={(cls) => setSelectedClass(cls)} />
  return <AdminGridView selectedClass={selectedClass} onBack={() => setSelectedClass(null)} />
}
