'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getMyGrades,
  getMyStudentInfo,
  getClasses,
  getClassStudents,
  getGradesByClass,
  saveClassGrades,
  getSubjects,
  getTeacherSubjects,
  getMe,
} from '@/lib/api'

interface GradeRow {
  id: string
  student_id?: number
  name: string
  studentId: string
  freq: string[]
  midTerm: string
  finalTerm: string
  average: string
  warning?: boolean
}

interface SubjectGrade {
  subject_id: number
  subject_name: string
  subject_code: string
  teacher_name?: string
  freq: string[]
  midTerm: string
  finalTerm: string
  average: string
}

function calcAverage(freq: string[], mid: string, final: string): string {
  const validFreqs = freq.map((f) => parseFloat(f)).filter((n) => !isNaN(n))
  const midNum = parseFloat(mid)
  const finalNum = parseFloat(final)
  let totalWeight = validFreqs.length
  let totalScore = validFreqs.reduce((a, b) => a + b, 0)
  if (!isNaN(midNum)) { totalScore += midNum * 2; totalWeight += 2 }
  if (!isNaN(finalNum)) { totalScore += finalNum * 3; totalWeight += 3 }
  if (totalWeight === 0) return '--'
  return (totalScore / totalWeight).toFixed(1)
}

function scoreColor(avg: string) {
  const n = parseFloat(avg)
  if (isNaN(n)) return 'text-gray-400'
  if (n >= 8.5) return 'text-emerald-600'
  if (n >= 6.5) return 'text-blue-600'
  if (n >= 5.0) return 'text-amber-600'
  return 'text-red-600'
}

const AVATAR_COLORS = [
  'bg-[#001d36]', 'bg-blue-600', 'bg-violet-600', 'bg-teal-600',
  'bg-rose-600', 'bg-amber-600', 'bg-indigo-600', 'bg-emerald-600',
]

function StudentGradebook({ userName }: { userName: string }) {
  const [subjects, setSubjects] = useState<SubjectGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [studentInfo, setStudentInfo] = useState<any>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [gradesRes, infoRes] = await Promise.all([getMyGrades(), getMyStudentInfo()])
        setStudentInfo(infoRes)
        if (gradesRes && gradesRes.length > 0) {
          const subjectMap = new Map<number, SubjectGrade>()
          for (const resItem of gradesRes) {
            const sid = resItem.subject_id
            if (!subjectMap.has(sid)) {
              subjectMap.set(sid, {
                subject_id: sid,
                subject_name: resItem.subject_name || resItem.subjects?.subject_name || `Môn học ${sid}`,
                subject_code: resItem.subject_code || resItem.subjects?.subject_code || 'MON',
                teacher_name: resItem.teacher_name,
                freq: [], midTerm: '--', finalTerm: '--', average: '--',
              })
            }
            const entry = subjectMap.get(sid)!
            if (Array.isArray(resItem.grade_items)) {
              for (const item of resItem.grade_items) {
                const scoreStr = item.score != null ? String(item.score) : '--'
                const typeName = (item.type_name || '').toLowerCase()
                if (typeName.includes('giữa') || typeName.includes('mid')) {
                  entry.midTerm = scoreStr
                } else if (typeName.includes('cuối') || typeName.includes('final')) {
                  entry.finalTerm = scoreStr
                } else {
                  entry.freq.push(scoreStr)
                }
              }
            }
          }
          subjectMap.forEach((e) => { e.average = calcAverage(e.freq, e.midTerm, e.finalTerm) })
          setSubjects(Array.from(subjectMap.values()))
        }
      } catch (err) {
        console.error('Failed to load student grades', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const overallAvg = useMemo(() => {
    const avgs = subjects.map((s) => parseFloat(s.average)).filter((n) => !isNaN(n))
    if (!avgs.length) return '--'
    return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
  }, [subjects])

  const className = studentInfo?.class_name || studentInfo?.classes?.class_name || ''

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#001d36] border-t-transparent" />
          <p className="text-sm text-gray-500 font-medium">Đang tải kết quả học tập...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#001d36] mb-1">
            <span className="material-symbols-outlined text-[18px]">school</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Kết quả học tập</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bảng điểm của {userName}</h2>
          {className && <p className="text-sm text-gray-500 mt-1">{className}</p>}
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm">
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
          Xuất PDF
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Điểm TB tổng kết', value: overallAvg, color: scoreColor(overallAvg) },
          { label: 'Số môn học', value: String(subjects.length), color: 'text-gray-900' },
          { label: 'Môn giỏi (>=8.5)', value: String(subjects.filter((s) => parseFloat(s.average) >= 8.5).length), color: 'text-emerald-600' },
          { label: 'Môn yếu (<5.0)', value: String(subjects.filter((s) => parseFloat(s.average) < 5.0).length), color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-gray-300 block mb-3">assignment</span>
          <p className="text-gray-400 font-semibold">Chưa có dữ liệu điểm số</p>
          <p className="text-gray-400 text-sm mt-1">Điểm sẽ được cập nhật sau khi giáo viên nhập</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subj, idx) => {
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
            const avg = parseFloat(subj.average)
            const isWarn = !isNaN(avg) && avg < 5.0
            return (
              <div key={subj.subject_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 ${colorClass} text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm`}>
                      {(subj.subject_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{subj.subject_name}</h4>
                      {subj.teacher_name && <p className="text-xs text-gray-500">GV: {subj.teacher_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isWarn && <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Cần cải thiện</span>}
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Điểm TB</p>
                      <span className={`text-3xl font-bold ${scoreColor(subj.average)}`}>{subj.average}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Thường xuyên</p>
                    {subj.freq.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {subj.freq.map((val, i) => (
                          <span key={i} className={`px-2.5 py-1 rounded-md text-xs font-bold border ${parseFloat(val) < 5 ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-200 text-gray-800 bg-white'}`}>{val || '--'}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Chưa có điểm</p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Giữa kỳ</p>
                    <p className="text-xl font-bold text-gray-900">{subj.midTerm}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cuối kỳ</p>
                    <p className="text-xl font-bold text-gray-900">{subj.finalTerm}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Đánh giá</p>
                    <p className="text-xs font-semibold text-gray-700">{avg >= 8.0 ? 'Xuất sắc' : avg >= 6.5 ? 'Khá' : avg >= 5.0 ? 'Trung bình' : isNaN(avg) ? '--' : 'Yếu'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TeacherGradebook({ userName }: { userName: string }) {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [rows, setRows] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const me = await getMe()
        const tId = me?.teacherId ?? null
        const clsRes = tId ? await getClasses({ teacherId: tId, limit: 50 }) : await getClasses({ limit: 50 })
        const clsList = clsRes?.data ?? []
        setClasses(clsList)
        if (clsList.length > 0) setSelectedClassId(clsList[0].class_id)

        let subjList: any[] = []
        if (tId) {
          subjList = await getTeacherSubjects(tId)
        }
        setSubjects(subjList)
        if (subjList.length > 0) setSelectedSubjectId(subjList[0].subject_id)
      } catch (err) {
        console.error('Failed to init teacher gradebook', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const loadGradesData = async () => {
    if (!selectedClassId) return
    setLoading(true)
    try {
      const [studentsData, gradesData] = await Promise.all([
        getClassStudents(selectedClassId!),
        getGradesByClass(selectedClassId!, selectedSubjectId ?? undefined),
      ])
      const studentList: any[] = studentsData ?? []
      const gradeList: any[] = Array.isArray(gradesData) ? gradesData : []
      const gradeMap = new Map<number, { freq: string[]; midTerm: string; finalTerm: string }>()

      gradeList.forEach((g: any) => {
        if (g.student_id) {
          gradeMap.set(g.student_id, {
            freq: Array.isArray(g.freq) ? g.freq : [],
            midTerm: g.midTerm != null && g.midTerm !== '' ? String(g.midTerm) : '',
            finalTerm: g.finalTerm != null && g.finalTerm !== '' ? String(g.finalTerm) : '',
          })
        }
      })

      const mapped: GradeRow[] = studentList.map((s: any) => {
        const g = gradeMap.get(s.student_id) ?? { freq: [], midTerm: '', finalTerm: '' }
        const freq = g.freq.length >= 4 ? g.freq.slice(0, 4) : [...g.freq, ...Array(4 - g.freq.length).fill('')]
        const avg = calcAverage(freq, g.midTerm, g.finalTerm)
        return {
          id: String(s.student_id),
          student_id: s.student_id,
          name: s.full_name || s.name || 'Học sinh',
          studentId: s.student_code || `HS${s.student_id}`,
          freq, midTerm: g.midTerm, finalTerm: g.finalTerm, average: avg,
          warning: parseFloat(avg) < 5.0,
        }
      })
      setRows(mapped)
    } catch (err) {
      console.error('Failed to load grades', err)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGradesData()
  }, [selectedClassId, selectedSubjectId])

  function handleScoreChange(id: string, field: 'freq' | 'midTerm' | 'finalTerm', index: number | undefined, value: string) {
    setRows((prev) => prev.map((s) => {
      if (s.id !== id) return s
      let updated = { ...s }
      if (field === 'freq' && typeof index === 'number') { const f = [...s.freq]; f[index] = value; updated.freq = f }
      else updated = { ...s, [field]: value }
      const avg = calcAverage(updated.freq, updated.midTerm, updated.finalTerm)
      return { ...updated, average: avg, warning: parseFloat(avg) < 5.0 }
    }))
  }

  async function handleSave() {
    if (!selectedClassId) return
    setSaving(true)
    try {
      const res = await saveClassGrades(selectedClassId, rows, selectedSubjectId ?? undefined)
      if (res && res.success !== false) {
        setSaveOk(true)
        setTimeout(() => setSaveOk(false), 3000)
        await loadGradesData()
      } else {
        alert('Lưu điểm thất bại: ' + (res?.error || 'Lỗi cơ sở dữ liệu'))
      }
    } catch (err) {
      console.error('Save grade error:', err)
      alert('Lưu điểm thất bại!')
    } finally {
      setSaving(false)
    }
  }

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)
  const selectedSubject = subjects.find((s) => s.subject_id === selectedSubjectId)
  const classAvg = useMemo(() => {
    const avgs = rows.map((r) => parseFloat(r.average)).filter((n) => !isNaN(n))
    if (!avgs.length) return '--'
    return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
  }, [rows])
  const warningCount = rows.filter((r) => r.warning).length
  const excellentCount = rows.filter((r) => parseFloat(r.average) >= 8.5).length
  const filledCount = rows.filter((r) => r.average !== '--').length

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#001d36] border-t-transparent" />
          <p className="text-sm text-gray-500 font-medium">Dang tai so diem...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#001d36] mb-1">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Quan ly diem so</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">So diem giao vien</h2>
          <p className="text-sm text-gray-500 mt-0.5">{userName}</p>
        </div>
        <div className="flex items-center gap-3">
          {saveOk && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Da luu thanh cong
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || rows.length === 0}
            className="px-4 py-2 bg-[#001d36] hover:bg-[#00284d] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">{saving ? 'hourglass_top' : 'save'}</span>
            {saving ? 'Dang luu...' : 'Luu diem'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Lop hoc</label>
          {classes.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Chua co lop nao</p>
          ) : (
            <select
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="w-full bg-transparent text-base font-bold text-gray-900 border-none focus:outline-none cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>{cls.class_name}{cls.homeroom_teacher_name ? ` - ${cls.homeroom_teacher_name}` : ''}</option>
              ))}
            </select>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Mon hoc</label>
          {subjects.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Chua co mon nao</p>
          ) : (
            <select
              value={selectedSubjectId ?? ''}
              onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
              className="w-full bg-transparent text-base font-bold text-gray-900 border-none focus:outline-none cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Si so', value: String(rows.length), color: 'text-gray-900' },
          { label: 'DTB lop', value: classAvg, color: scoreColor(classAvg) },
          { label: 'Hoc sinh gioi', value: String(excellentCount), color: 'text-emerald-600' },
          { label: 'Can chu y (<5)', value: String(warningCount), color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {selectedClass?.class_name ?? 'Lop hoc'}{selectedSubject ? ` - ${selectedSubject.subject_name}` : ''}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{filledCount}/{rows.length} hoc sinh da co diem</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#001d36] border-t-transparent" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">group</span>
            <p className="text-gray-400 font-semibold">Chua co hoc sinh trong lop nay</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                  <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hoc sinh</th>
                  {['TX1','TX2','TX3','TX4'].map((h) => (
                    <th key={h} className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                  <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">GK <span className="text-[8px] text-orange-500">x2</span></th>
                  <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">CK <span className="text-[8px] text-red-500">x3</span></th>
                  <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">DTB</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={`transition-colors ${row.warning ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50/60'}`}>
                    <td className="px-5 py-3 text-xs text-gray-400 font-semibold">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                          {(row.name.split(' ').pop() ?? '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{row.name}</p>
                          <p className="text-[10px] text-gray-400">{row.studentId}</p>
                        </div>
                      </div>
                    </td>
                    {row.freq.map((val, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleScoreChange(row.id, 'freq', i, e.target.value)}
                          placeholder="-"
                          className={`w-10 h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:border-[#001d36] transition ${
                            parseFloat(val) < 5 && val !== '' ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-200 text-gray-800 bg-gray-50'
                          }`}
                        />
                      </td>
                    ))}
                    {(['midTerm', 'finalTerm'] as const).map((field) => (
                      <td key={field} className="px-3 py-3 text-center">
                        <input
                          type="text"
                          value={row[field]}
                          onChange={(e) => handleScoreChange(row.id, field, undefined, e.target.value)}
                          placeholder="-"
                          className={`w-12 h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:border-[#001d36] transition ${
                            parseFloat(row[field]) < 5 && row[field] !== '' ? 'border-red-300 text-red-700 bg-red-50' : 'border-gray-200 text-gray-800 bg-gray-50'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-14 py-1 rounded-full text-xs font-bold ${
                        row.warning ? 'bg-red-100 text-red-700' :
                        parseFloat(row.average) >= 8.5 ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-50 text-[#001d36]'
                      }`}>
                        {row.average}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GradebookPage() {
  const { user } = useAuth()
  const role = (user?.role || '').toLowerCase()
  const isStudent = role === 'student' || role.includes('hocsinh')
  const userName = user?.name || 'Nguoi dung'

  if (isStudent) return <div className="min-h-screen bg-gray-50"><StudentGradebook userName={userName} /></div>
  return <div className="min-h-screen bg-gray-50"><TeacherGradebook userName={userName} /></div>
}
