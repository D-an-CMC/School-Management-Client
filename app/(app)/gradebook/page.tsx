'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { isScoredSubject, isGradedSubject } from '@/lib/utils'
import {
  getMyGrades,
  getMyGradesYear,
  getMyStudentInfo,
  getClasses,
  getClassStudents,
  getGradesByClass,
  saveClassGrades,
  getSubjects,
  getTeacherSubjects,
  getMe,
  getTimetables,
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
  ranking?: string
  avg1?: string
  avg2?: string
}

interface SubjectGrade {
  subject_id: number
  subject_name: string
  subject_code: string
  teacher_name?: string
  teacher_code?: string
  freq: string[]
  midTerm: string
  finalTerm: string
  average: string
  ranking?: string
  avg1?: number | null
  avg2?: number | null
  nonScored?: boolean
}

// Chọn học kỳ 1 (term_order nhỏ nhất) từ danh sách học kỳ của năm hiện tại.
function week1Semester(semesters: any[], currentSchoolYear: any): number | null {
  const list = (semesters ?? []).filter(
    (s: any) => currentSchoolYear && Number(s.school_year_id) === Number(currentSchoolYear.school_year_id),
  )
  if (!list.length) return null
  const sorted = [...list].sort((a, b) => Number(a.term_order) - Number(b.term_order))
  return sorted[0]?.semester_id ?? null
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
  const { selectedSemesterId, semesters, currentSchoolYear } = useAcademic()
  const [subjects, setSubjects] = useState<SubjectGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [semMode, setSemMode] = useState<'sem1' | 'sem2' | 'year'>('year')
  const [yearRes, setYearRes] = useState<any>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const infoRes = await getMyStudentInfo()
        setStudentInfo(infoRes)
        if (semMode === 'year') {
          const yr = await getMyGradesYear()
          setYearRes(yr)
          const rows: SubjectGrade[] = (yr?.rows ?? []).map((s: any) => {
            const nonScored = isScoredSubject(s.subject_id) === false
            return {
              subject_id: s.subject_id,
              subject_name: s.subject_name,
              subject_code: s.subject_code,
              teacher_name: s.teacher_name,
              teacher_code: s.teacher_code,
              freq: [],
              midTerm: '--',
              finalTerm: '--',
              average: s.yearAvg != null ? String(s.yearAvg) : '--',
              ranking: nonScored ? s.ranking : '',
              avg1: s.avg1,
              avg2: s.avg2,
              nonScored,
            }
          })
          setSubjects(rows.filter((e) => isGradedSubject(e.subject_id)))
        } else {
          setYearRes(null)
          const semId = semMode === 'sem1'
            ? week1Semester(semesters, currentSchoolYear)
            : (selectedSemesterId ?? week1Semester(semesters, currentSchoolYear))
          const gradesRes = await getMyGrades(semId ?? undefined)
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
                  teacher_code: resItem.teacher_code,
                  freq: [], midTerm: '--', finalTerm: '--', average: '--',
                  ranking: resItem.ranking || '',
                  avg1: resItem.avg1, avg2: resItem.avg2, nonScored: false,
                })
              }
              const entry = subjectMap.get(sid)!
              if (resItem.ranking) entry.ranking = resItem.ranking
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
            setSubjects(Array.from(subjectMap.values()).filter((e) => isGradedSubject(e.subject_id)))
          } else {
            setSubjects([])
          }
        }
      } catch (err) {
        console.error('Failed to load student grades', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [semMode, selectedSemesterId, semesters, currentSchoolYear])

  const overallAvg = useMemo(() => {
    const avgs = subjects
      .filter((s) => isScoredSubject(s.subject_id))
      .map((s) => parseFloat(s.average))
      .filter((n) => !isNaN(n))
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

      <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm w-fit">
        {([
          { key: 'sem1', label: 'Học kỳ 1' },
          { key: 'sem2', label: 'Học kỳ 2' },
          { key: 'year', label: 'Cả năm' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setSemMode(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              semMode === t.key ? 'bg-[#001d36] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {semMode === 'year' && yearRes?.sem1Id && (
        <p className="text-xs text-gray-400 -mt-4">
          Điểm cả năm = (ĐTB môn HK1 + 2 × ĐTB môn HK2) / 3
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Điểm TB tổng kết', value: overallAvg, color: scoreColor(overallAvg) },
          { label: 'Số môn học', value: String(subjects.length), color: 'text-gray-900' },
          { label: 'Môn giỏi (>=8.5)', value: String(subjects.filter((s) => parseFloat(s.average) >= 8.5).length), color: 'text-emerald-600' },
          { label: 'Môn yếu (<5.0) hoặc chưa đạt', value: String(
            subjects.filter((s) => {
              const n = parseFloat(s.average)
              if (!isNaN(n)) return n < 5.0
              return isScoredSubject(s.subject_id) === false && s.ranking === 'Chưa đạt'
            }).length
          ), color: 'text-red-500' },
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
            const nonScored = !isScoredSubject(subj.subject_id)
            const rankVal = subj.ranking || ''
            return (
              <div key={subj.subject_id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 ${colorClass} text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm`}>
                      {(subj.subject_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{subj.subject_name}</h4>
                      {subj.teacher_name && (
                        <p className="text-xs text-gray-500">
                          GV: {subj.teacher_name}
                          {subj.teacher_code && <span className="text-gray-400"> • Mã GV: {subj.teacher_code}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isWarn && <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">Cần cải thiện</span>}
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{nonScored ? 'Xếp loại' : 'Điểm TB'}</p>
                      {nonScored ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          rankVal && rankVal !== 'Chưa đạt' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {rankVal || 'Chưa nhập'}
                        </span>
                      ) : (
                        <span className={`text-3xl font-bold ${scoreColor(subj.average)}`}>{subj.average}</span>
                      )}
                    </div>
                  </div>
                </div>
                {semMode !== 'year' && !nonScored && (
                  <div className="px-5 py-3 border-b border-gray-100 bg-[#fafcff]">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Điểm thường xuyên</p>
                        <p className="text-sm font-bold text-gray-800">
                          {subj.freq.length > 0 ? subj.freq.join(', ') : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Giữa kỳ</p>
                        <p className="text-sm font-bold text-gray-800">{subj.midTerm !== '--' ? subj.midTerm : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cuối kỳ</p>
                        <p className="text-sm font-bold text-gray-800">{subj.finalTerm !== '--' ? subj.finalTerm : '—'}</p>
                      </div>
                    </div>
                  </div>
                )}
                {semMode === 'year' && (
                  <div className="px-5 py-3 grid grid-cols-2 gap-4 border-b border-gray-100 bg-[#fafcff]">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Học kỳ 1</p>
                      {nonScored ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          subj.ranking === 'Chưa đạt' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {subj.ranking && subj.ranking !== 'Chưa đạt' ? 'Đạt' : subj.ranking || '—'}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">{subj.avg1 != null ? subj.avg1 : '—'}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Học kỳ 2</p>
                      {nonScored ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          subj.ranking === 'Chưa đạt' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {subj.ranking && subj.ranking !== 'Chưa đạt' ? 'Đạt' : subj.ranking || '—'}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-gray-800">{subj.avg2 != null ? subj.avg2 : '—'}</span>
                      )}
                    </div>
                  </div>
                )}
                {nonScored ? (
                  <div className="p-5">
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kết quả</p>
                      <p className="text-sm font-bold text-gray-800">{rankVal || 'Chưa có kết quả'}</p>
                    </div>
                  </div>
                ) : (
                <div className="p-5">
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đánh giá</p>
                    <p className="text-sm font-bold text-gray-800">{avg >= 8.0 ? 'Xuất sắc' : avg >= 6.5 ? 'Khá' : avg >= 5.0 ? 'Trung bình' : isNaN(avg) ? '--' : 'Yếu'}</p>
                  </div>
                </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TeacherGradebook({ userName }: { userName: string }) {
  const { selectedSemesterId, selectedSchoolYearId, currentSchoolYear, semesters } = useAcademic()
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [subjectByClass, setSubjectByClass] = useState<Record<number, any[]>>({})
  const [rows, setRows] = useState<GradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveOk, setSaveOk] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [semMode, setSemMode] = useState<'sem1' | 'sem2' | 'year'>('year')

  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? undefined
  const yearSems = effectiveYearId != null
    ? semesters.filter((s: any) => Number(s.school_year_id) === Number(effectiveYearId))
    : []
  const defaultSem = yearSems.find((s: any) => s.is_active)?.semester_id ?? yearSems[0]?.semester_id
  const sem1Id = yearSems.length ? yearSems[0]?.semester_id ?? null : null
  const sem2Id = yearSems.length > 1 ? yearSems[1]?.semester_id ?? null : null
  const effectiveSemesterId = selectedSemesterId ?? defaultSem
  // Học kỳ hiển thị theo tab: ưu tiên tab, fallback về học kỳ từ header.
  const activeSemesterId = semMode === 'sem1'
    ? (sem1Id ?? effectiveSemesterId)
    : semMode === 'sem2'
      ? (sem2Id ?? effectiveSemesterId)
      : effectiveSemesterId
  const isYearView = semMode === 'year'

  // Classes & subjects the teacher actually teaches come from the timetables of the
  // selected semester/year (not teaching_assignments, which may be empty).
  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const me = await getMe()
        const tId = me?.teacherId ?? null
        if (!tId) {
          setClasses([])
          setSubjects([])
          setSelectedClassId(null)
          setSelectedSubjectId(null)
          return
        }
        const ttRes = await getTimetables({ teacherId: tId, semesterId: effectiveSemesterId, limit: 500 })
        const entries: any[] = ttRes?.data ?? []
        const clsMap = new Map<number, any>()
        const byClass = new Map<number, Map<number, any>>()
        entries.forEach((t: any) => {
          const subjRel = Array.isArray(t.subjects) ? t.subjects[0] : t.subjects
          if (t.class_id != null) {
            clsMap.set(Number(t.class_id), {
              class_id: t.class_id,
              class_name: t.class_name || (Array.isArray(t.classes) ? t.classes[0]?.class_name : t.classes?.class_name) || `Lớp ${t.class_id}`,
              homeroom_teacher_name: t.classes?.homeroom_teacher_name,
            })
          }
          if (t.subject_id != null && subjRel?.subject_name) {
            const cid = Number(t.class_id)
            if (!byClass.has(cid)) byClass.set(cid, new Map())
            byClass.get(cid)!.set(Number(t.subject_id), {
              subject_id: t.subject_id,
              subject_name: subjRel.subject_name,
              subject_code: subjRel.subject_code,
            })
          }
        })
        const clsList = Array.from(clsMap.values()).sort((a, b) => {
          const matchA = (a.class_name || '').match(/\d+/)
          const matchB = (b.class_name || '').match(/\d+/)
          const gradeA = matchA ? parseInt(matchA[0], 10) : 999
          const gradeB = matchB ? parseInt(matchB[0], 10) : 999
          if (gradeA !== gradeB) return gradeA - gradeB
          return (a.class_name || '').localeCompare(b.class_name || '', 'vi', { numeric: true, sensitivity: 'base' })
        })
        const byClassObj: Record<number, any[]> = {}
        byClass.forEach((m, cid) => {
          byClassObj[cid] = Array.from(m.values()).filter((v) => isGradedSubject(v.subject_id))
        })
        setClasses(clsList)
        setSubjectByClass(byClassObj)
        const firstSubjList = byClassObj[clsList[0]?.class_id] ?? []
        setSubjects(firstSubjList)
        if (clsList.length > 0) setSelectedClassId(clsList[0].class_id)
        else setSelectedClassId(null)
        if (firstSubjList.length > 0) setSelectedSubjectId(firstSubjList[0].subject_id)
        else setSelectedSubjectId(null)
      } catch (err) {
        console.error('Failed to init teacher gradebook', err)
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveYearId, effectiveSemesterId])

  // When the selected class changes, show only the subjects the teacher teaches in that class.
  useEffect(() => {
    if (selectedClassId == null) {
      setSubjects([])
      setSelectedSubjectId(null)
      return
    }
    const subjList = subjectByClass[selectedClassId] ?? []
    setSubjects(subjList)
    // Reset subject selection if the previous subject isn't taught in this class.
    if (!subjList.some((s: any) => Number(s.subject_id) === Number(selectedSubjectId))) {
      setSelectedSubjectId(subjList[0]?.subject_id ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, subjectByClass])

  const loadGradesData = async () => {
    if (!selectedClassId) return
    setLoading(true)
    try {
      const [studentsData, gradesData] = await Promise.all([
        getClassStudents(selectedClassId!),
        isYearView
          ? getGradesByClass(selectedClassId!, selectedSubjectId ?? undefined, undefined, 'year')
          : getGradesByClass(selectedClassId!, selectedSubjectId ?? undefined, activeSemesterId ?? undefined),
      ])
      const studentList: any[] = studentsData ?? []
      const gradeList: any[] = Array.isArray(gradesData) ? gradesData : []
      const gradeMap = new Map<number, { freq: string[]; midTerm: string; finalTerm: string; ranking: string; avg1?: string; avg2?: string }>()

      gradeList.forEach((g: any) => {
        if (g.student_id) {
          const sem1 = g.sem1 || {}
          const sem2 = g.sem2 || {}
          const a1 = isYearView ? calcAverage(Array.isArray(sem1.freq) ? sem1.freq : [], sem1.midTerm, sem1.finalTerm) : undefined
          const a2 = isYearView ? calcAverage(Array.isArray(sem2.freq) ? sem2.freq : [], sem2.midTerm, sem2.finalTerm) : undefined
          gradeMap.set(g.student_id, {
            freq: Array.isArray(g.freq) ? g.freq : [],
            midTerm: g.midTerm != null && g.midTerm !== '' ? String(g.midTerm) : '',
            finalTerm: g.finalTerm != null && g.finalTerm !== '' ? String(g.finalTerm) : '',
            ranking: g.ranking || '',
            avg1: isYearView && a1 !== '--' ? a1 : undefined,
            avg2: isYearView && a2 !== '--' ? a2 : undefined,
          })
        }
      })

      const mapped: GradeRow[] = studentList.map((s: any) => {
        const g = gradeMap.get(s.student_id) ?? { freq: [], midTerm: '', finalTerm: '', ranking: '', avg1: undefined, avg2: undefined }
        const freq = g.freq.length >= 4 ? g.freq.slice(0, 4) : [...g.freq, ...Array(4 - g.freq.length).fill('')]
        const avg = calcAverage(freq, g.midTerm, g.finalTerm)
        return {
          id: String(s.student_id),
          student_id: s.student_id,
          name: s.full_name || s.name || 'Học sinh',
          studentId: s.student_code || `HS${s.student_id}`,
          freq, midTerm: g.midTerm, finalTerm: g.finalTerm, average: avg,
          warning: parseFloat(avg) < 5.0,
          ranking: g.ranking,
          avg1: g.avg1,
          avg2: g.avg2,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, selectedSubjectId, selectedSemesterId, effectiveYearId, semMode])

  function handleScoreChange(id: string, field: 'freq' | 'midTerm' | 'finalTerm', index: number | undefined, value: string) {
    if (isYearView) return
    setRows((prev) => prev.map((s) => {
      if (s.id !== id) return s
      let updated = { ...s }
      if (field === 'freq' && typeof index === 'number') { const f = [...s.freq]; f[index] = value; updated.freq = f }
      else updated = { ...s, [field]: value }
      const avg = calcAverage(updated.freq, updated.midTerm, updated.finalTerm)
      return { ...updated, average: avg, warning: parseFloat(avg) < 5.0 }
    }))
  }

  function handleRankingChange(id: string, value: string) {
    if (isYearView) return
    setRows((prev) => prev.map((s) => (s.id === id ? { ...s, ranking: value } : s)))
  }

  async function handleSave() {
    if (!selectedClassId || isYearView) return
    setSaving(true)
    try {
      const res = await saveClassGrades(selectedClassId, rows, selectedSubjectId ?? undefined, activeSemesterId ?? undefined)
      if (res && res.success !== false) {
        setSaveOk(true)
        setTimeout(() => setSaveOk(false), 3000)
        await loadGradesData()
      } else {
        setSaveErr('Lưu điểm thất bại: ' + (res?.error || 'Lỗi cơ sở dữ liệu'))
        setTimeout(() => setSaveErr(null), 4000)
      }
    } catch (err) {
      console.error('Save grade error:', err)
      setSaveErr('Lưu điểm thất bại!')
      setTimeout(() => setSaveErr(null), 4000)
    } finally {
      setSaving(false)
    }
  }

  const selectedClass = classes.find((c) => c.class_id === selectedClassId)
  const selectedSubject = subjects.find((s) => s.subject_id === selectedSubjectId)
  const nonScored = isScoredSubject(selectedSubjectId) === false
  const classAvg = useMemo(() => {
    const avgs = rows.map((r) => parseFloat(r.average)).filter((n) => !isNaN(n))
    if (!avgs.length) return '--'
    return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
  }, [rows])
  const warningCount = rows.filter((r) => r.warning).length
  const excellentCount = rows.filter((r) => parseFloat(r.average) >= 8.5).length
  const filledCount = rows.filter((r) => r.ranking).length

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
          {saveErr && (
            <span className="text-xs font-bold text-red-600 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {saveErr}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || rows.length === 0 || isYearView}
            className="px-4 py-2 bg-[#001d36] hover:bg-[#00284d] text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">{saving ? 'hourglass_top' : 'save'}</span>
            {saving ? 'Dang luu...' : 'Luu diem'}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm w-fit">
        {([
          { key: 'sem1', label: 'Học kỳ 1' },
          { key: 'sem2', label: 'Học kỳ 2' },
          { key: 'year', label: 'Cả năm' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setSemMode(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
              semMode === t.key ? 'bg-[#001d36] text-white shadow' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
        {isYearView && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">
            Chỉ xem
          </span>
        )}
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
        {(nonScored
          ? [
              { label: 'Si so', value: String(rows.length), color: 'text-gray-900' },
              { label: 'Dat', value: String(rows.filter((r) => r.ranking === 'Đạt').length), color: 'text-emerald-600' },
              { label: 'Chua dat', value: String(rows.filter((r) => r.ranking === 'Chưa đạt').length), color: 'text-red-500' },
              { label: 'Chua nhap', value: String(rows.filter((r) => !r.ranking).length), color: 'text-gray-400' },
            ]
          : [
              { label: 'Si so', value: String(rows.length), color: 'text-gray-900' },
              { label: 'DTB lop', value: classAvg, color: scoreColor(classAvg) },
              { label: 'Hoc sinh gioi', value: String(excellentCount), color: 'text-emerald-600' },
              { label: 'Can chu y (<5)', value: String(warningCount), color: 'text-red-500' },
            ]
        ).map((stat) => (
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
                  {isYearView && !nonScored && (
                    <>
                      <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">HK1</th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">HK2</th>
                    </>
                  )}
                  {nonScored ? (
                    <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Xep loai</th>
                  ) : (
                    <>
                      {['TX1','TX2','TX3','TX4'].map((h) => (
                        <th key={h} className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                      <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">GK <span className="text-[8px] text-orange-500">x2</span></th>
                      <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">CK <span className="text-[8px] text-red-500">x3</span></th>
                      <th className="px-5 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">DTB</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {rows.map((row, idx) => (
                  <tr key={row.id} className={`transition-colors ${nonScored ? 'hover:bg-gray-50/60' : row.warning ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50/60'}`}>
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
                    {isYearView && !nonScored && (
                      <>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-12 py-1 rounded-full text-xs font-bold ${
                            row.avg1 && parseFloat(row.avg1) < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {row.avg1 ?? '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-flex items-center justify-center w-12 py-1 rounded-full text-xs font-bold ${
                            row.avg2 && parseFloat(row.avg2) < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {row.avg2 ?? '—'}
                          </span>
                        </td>
                      </>
                    )}
                    {nonScored ? (
                      <td className="px-3 py-3 text-center">
                        <select
                          value={row.ranking || ''}
                          onChange={(e) => handleRankingChange(row.id, e.target.value)}
                          disabled={isYearView}
                          className={`w-32 h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:border-[#001d36] transition cursor-pointer ${isYearView ? 'opacity-60 cursor-not-allowed ' : ''}${
                            row.ranking === 'Chưa đạt' ? 'border-red-300 text-red-700 bg-red-50' :
                            row.ranking === 'Đạt' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                            'border-gray-200 text-gray-500 bg-gray-50'
                          }`}
                        >
                          <option value="">--</option>
                          <option value="Đạt">Đạt</option>
                          <option value="Chưa đạt">Chưa đạt</option>
                        </select>
                      </td>
                    ) : (
                      <>
                    {row.freq.map((val, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleScoreChange(row.id, 'freq', i, e.target.value)}
                          disabled={isYearView}
                          placeholder="-"
                          className={`w-10 h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:border-[#001d36] transition ${isYearView ? 'opacity-60 cursor-not-allowed ' : ''}${
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
                          disabled={isYearView}
                          placeholder="-"
                          className={`w-12 h-8 text-center rounded-lg border text-xs font-bold focus:outline-none focus:border-[#001d36] transition ${isYearView ? 'opacity-60 cursor-not-allowed ' : ''}${
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
                      </>
                    )}
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
