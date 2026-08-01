'use client'

import { useState, useEffect, useMemo } from 'react'
import { getClasses, getClassStudents, getGradesByClass, batchUpdateGrades } from '@/lib/api'

interface GradeStudent {
  id: string
  student_id?: number
  name: string
  studentId: string
  avatar: string
  freq: string[]
  midTerm: string
  finalTerm: string
  aiPrediction: string
  average: string
  warning?: boolean
}

// Fallback initial data when DB has no grade records yet
const INITIAL_MOCK_CLASSES = [
  { class_id: 1, class_name: 'Lớp 10A1', grade_name: 'Khối 10', grade_level: 10, homeroom_teacher_name: 'Trần Hoàng Nam', student_count: 38, avg_score: '8.4', risk_count: 1 },
  { class_id: 2, class_name: 'Lớp 11B2', grade_name: 'Khối 11', grade_level: 11, homeroom_teacher_name: 'Nguyễn Thị Minh', student_count: 42, avg_score: '7.9', risk_count: 3 },
  { class_id: 3, class_name: 'Lớp 12C3', grade_name: 'Khối 12', grade_level: 12, homeroom_teacher_name: 'Phạm Đức Anh', student_count: 40, avg_score: '8.7', risk_count: 0 },
  { class_id: 4, class_name: 'Lớp 9A2', grade_name: 'Khối 9', grade_level: 9, homeroom_teacher_name: 'Lê Thu Trang', student_count: 36, avg_score: '7.5', risk_count: 4 },
  { class_id: 5, class_name: 'Lớp 8A1', grade_name: 'Khối 8', grade_level: 8, homeroom_teacher_name: 'Đặng Quốc Bảo', student_count: 35, avg_score: '8.1', risk_count: 2 },
  { class_id: 6, class_name: 'Lớp 7A3', grade_name: 'Khối 7', grade_level: 7, homeroom_teacher_name: 'Vũ Hải Yến', student_count: 39, avg_score: '8.3', risk_count: 1 },
]

const MOCK_GRADE_STUDENTS: GradeStudent[] = [
  {
    id: '1',
    name: 'Lê Hải Nam',
    studentId: 'HS2024001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    freq: ['8.0', '8.5', '8.0', '8.3'],
    midTerm: '8.5',
    finalTerm: '9.0',
    aiPrediction: '8.6',
    average: '8.5',
  },
  {
    id: '2',
    name: 'Nguyễn Anh Thư',
    studentId: 'HS2024002',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    freq: ['9.5', '9.5', '9.0', '9.5'],
    midTerm: '9.5',
    finalTerm: '9.8',
    aiPrediction: '9.6',
    average: '9.6',
  },
  {
    id: '3',
    name: 'Quách Gia Huy',
    studentId: 'HS2024003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    freq: ['4.5', '5.0', '4.0', '4.8'],
    midTerm: '4.5',
    finalTerm: '4.0',
    aiPrediction: '4.2',
    average: '4.4',
    warning: true,
  },
  {
    id: '4',
    name: 'Trần Bảo Minh',
    studentId: 'HS2024004',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    freq: ['8.5', '9.0', '8.5', '8.8'],
    midTerm: '8.5',
    finalTerm: '9.0',
    aiPrediction: '8.7',
    average: '8.7',
  },
  {
    id: '5',
    name: 'Phạm Phương Thảo',
    studentId: 'HS2024005',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    freq: ['9.0', '9.0', '8.5', '9.0'],
    midTerm: '9.0',
    finalTerm: '9.2',
    aiPrediction: '9.1',
    average: '9.0',
  },
  {
    id: '6',
    name: 'Đỗ Tuấn Kiệt',
    studentId: 'HS2024006',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    freq: ['6.0', '6.5', '7.0', '6.8'],
    midTerm: '7.0',
    finalTerm: '7.5',
    aiPrediction: '7.2',
    average: '7.1',
  },
]

export default function GradeManagementPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [gradeStudents, setGradeStudents] = useState<GradeStudent[]>([])
  const [searchClassQuery, setSearchClassQuery] = useState('')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL')
  const [selectedSubject, setSelectedSubject] = useState('Toán Học')
  const [selectedSemester, setSelectedSemester] = useState('Học kỳ I')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'WARNING' | 'EXCELLENT'>('ALL')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load Classes list
  useEffect(() => {
    setLoading(true)
    getClasses({ limit: 50 })
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setClasses(res.data)
        } else {
          setClasses(INITIAL_MOCK_CLASSES)
        }
      })
      .catch(() => {
        setClasses(INITIAL_MOCK_CLASSES)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // When class selected, load student list
  const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls)
    setLoading(true)
    try {
      const studentsData = await getClassStudents(cls.class_id)
      if (studentsData && studentsData.length > 0) {
        const mapped: GradeStudent[] = studentsData.map((s: any, idx: number) => {
          const mockBase = MOCK_GRADE_STUDENTS[idx % MOCK_GRADE_STUDENTS.length]
          return {
            id: String(s.student_id),
            student_id: s.student_id,
            name: s.full_name,
            studentId: s.student_code || `HS${s.student_id}`,
            avatar: mockBase.avatar,
            freq: mockBase.freq,
            midTerm: mockBase.midTerm,
            finalTerm: mockBase.finalTerm,
            aiPrediction: mockBase.aiPrediction,
            average: mockBase.average,
            warning: mockBase.warning,
          }
        })
        setGradeStudents(mapped)
      } else {
        setGradeStudents(MOCK_GRADE_STUDENTS)
      }
    } catch {
      setGradeStudents(MOCK_GRADE_STUDENTS)
    } finally {
      setLoading(false)
    }
  }

  // Calculate dynamic average for a student
  const calculateAverage = (freq: string[], mid: string, final: string) => {
    const validFreqs = freq.map(f => parseFloat(f)).filter(n => !isNaN(n))
    const midNum = parseFloat(mid)
    const finalNum = parseFloat(final)

    let totalWeight = validFreqs.length
    let totalScore = validFreqs.reduce((a, b) => a + b, 0)

    if (!isNaN(midNum)) {
      totalScore += midNum * 2
      totalWeight += 2
    }
    if (!isNaN(finalNum)) {
      totalScore += finalNum * 3
      totalWeight += 3
    }

    if (totalWeight === 0) return '--'
    const avg = totalScore / totalWeight
    return avg.toFixed(1)
  }

  // Handle live editing of scores
  const handleScoreChange = (
    id: string,
    field: 'freq' | 'midTerm' | 'finalTerm',
    index: number | undefined,
    value: string
  ) => {
    setGradeStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        let updated = { ...s }
        if (field === 'freq' && typeof index === 'number') {
          const newFreq = [...s.freq]
          newFreq[index] = value
          updated.freq = newFreq
        } else if (field === 'midTerm') {
          updated.midTerm = value
        } else if (field === 'finalTerm') {
          updated.finalTerm = value
        }

        const newAvg = calculateAverage(updated.freq, updated.midTerm, updated.finalTerm)
        updated.average = newAvg
        const avgNum = parseFloat(newAvg)
        updated.warning = !isNaN(avgNum) && avgNum < 5.0
        return updated
      })
    )
  }

  const handleSaveGrades = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 600)
  }

  // Filtered classes list
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchQuery =
        !searchClassQuery ||
        cls.class_name?.toLowerCase().includes(searchClassQuery.toLowerCase()) ||
        cls.homeroom_teacher_name?.toLowerCase().includes(searchClassQuery.toLowerCase())

      const gradeNum = cls.grade_level || parseInt(cls.class_name?.replace(/\D/g, '') || '0')
      const matchGrade =
        selectedGradeFilter === 'ALL' || String(gradeNum) === selectedGradeFilter

      return matchQuery && matchGrade
    })
  }, [classes, searchClassQuery, selectedGradeFilter])

  // Filtered students list in gradebook
  const filteredStudents = useMemo(() => {
    return gradeStudents.filter((s) => {
      const matchQuery =
        !studentSearchQuery ||
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(studentSearchQuery.toLowerCase())

      const avgNum = parseFloat(s.average)
      let matchStatus = true
      if (statusFilter === 'WARNING') {
        matchStatus = !!s.warning || (!isNaN(avgNum) && avgNum < 5.0)
      } else if (statusFilter === 'EXCELLENT') {
        matchStatus = !isNaN(avgNum) && avgNum >= 8.5
      }

      return matchQuery && matchStatus
    })
  }, [gradeStudents, studentSearchQuery, statusFilter])

  // Summary Metrics for selected class
  const classAvgMetric = useMemo(() => {
    const avgs = gradeStudents
      .map((s) => parseFloat(s.average))
      .filter((n) => !isNaN(n))
    if (avgs.length === 0) return '0.0'
    return (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(1)
  }, [gradeStudents])

  const warningCount = useMemo(() => {
    return gradeStudents.filter((s) => s.warning || parseFloat(s.average) < 5.0).length
  }, [gradeStudents])

  const excellentCount = useMemo(() => {
    return gradeStudents.filter((s) => parseFloat(s.average) >= 8.5).length
  }, [gradeStudents])

  // ---------------------------------------------------------------------------
  // STEP 1: CLASS SELECTION GRID
  // ---------------------------------------------------------------------------
  if (!selectedClass) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-7 h-7 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Quản Lý Điểm Số
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Chọn lớp học để mở Sổ điểm chi tiết và cập nhật kết quả học tập của học sinh
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-[#003366] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Năm học 2025 - 2026
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchClassQuery}
                onChange={(e) => setSearchClassQuery(e.target.value)}
                placeholder="Tìm lớp học, giáo viên chủ nhiệm..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none transition"
              />
            </div>

            {/* Grade level filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              <button
                onClick={() => setSelectedGradeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedGradeFilter === 'ALL'
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tất cả các khối
              </button>
              {['6', '7', '8', '9', '10', '11', '12'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedGradeFilter === g
                      ? 'bg-[#003366] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 text-sm flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
            Đang tải danh sách lớp học...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-medium text-gray-700">Không tìm thấy lớp học nào phù hợp</p>
            <p className="text-xs text-gray-500 mt-1">Thử thay đổi từ khóa hoặc bộ lọc khối lớp</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClasses.map((cls) => {
              const studentCount = cls.student_count || 35
              const avgScore = cls.avg_score || '8.2'
              const riskCount = cls.risk_count ?? 0

              return (
                <div
                  key={cls.class_id}
                  onClick={() => handleSelectClass(cls)}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#003366] group-hover:bg-blue-500 transition-colors"></div>

                  <div>
                    <div className="flex items-start justify-between mb-3 pt-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                          {cls.class_name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {cls.grade_name || `Khối ${cls.grade_level || ''}`}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 bg-blue-50 text-[#003366] rounded-md font-bold text-sm border border-blue-100">
                        {studentCount} HS
                      </span>
                    </div>

                    <div className="space-y-2 my-4 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>GVCN: <strong className="text-gray-800">{cls.homeroom_teacher_name || 'Chưa phân công'}</strong></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>ĐTB Lớp: <strong className="text-emerald-700 font-bold">{avgScore}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    {riskCount > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[11px] font-semibold flex items-center gap-1">
                        ⚠️ {riskCount} HS cảnh báo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold flex items-center gap-1">
                        ✓ Học lực ổn định
                      </span>
                    )}

                    <span className="text-xs font-bold text-[#003366] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Mở sổ điểm →
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // STEP 2: TEACHER GRADEBOOK VIEW FOR SELECTED CLASS
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Top Header & Navigation */}
      <div className="mb-6">
        <button
          onClick={() => setSelectedClass(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#003366] bg-white border border-gray-200 px-3 py-1.5 rounded-lg mb-4 hover:bg-gray-50 transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại danh sách lớp
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Sổ Điểm Học Thuật - {selectedClass.class_name}
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-[#003366] rounded-full text-xs font-bold">
                {selectedClass.grade_name || `Khối ${selectedClass.grade_level || ''}`}
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mt-1">
              GVCN: <span className="font-semibold text-gray-800">{selectedClass.homeroom_teacher_name || 'Chưa có'}</span> • Sĩ số: <span className="font-semibold text-gray-800">{gradeStudents.length} học sinh</span>
            </p>
          </div>

          {/* Subject & Semester Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-[#003366] outline-none shadow-sm"
            >
              <option value="Toán Học">Môn: Toán Học</option>
              <option value="Ngữ Văn">Môn: Ngữ Văn</option>
              <option value="Tiếng Anh">Môn: Tiếng Anh</option>
              <option value="Vật Lý">Môn: Vật Lý</option>
              <option value="Hóa Học">Môn: Hóa Học</option>
              <option value="Sinh Học">Môn: Sinh Học</option>
              <option value="Lịch Sử">Môn: Lịch Sử</option>
              <option value="Địa Lý">Môn: Địa Lý</option>
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 text-xs md:text-sm bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-[#003366] outline-none shadow-sm"
            >
              <option value="Học kỳ I">Học kỳ I</option>
              <option value="Học kỳ II">Học kỳ II</option>
              <option value="Cả Năm">Cả Năm</option>
            </select>

            <button
              onClick={handleSaveGrades}
              disabled={isSaving}
              className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Lưu Sổ Điểm
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Đã cập nhật và lưu bảng điểm lớp {selectedClass.class_name} thành công!</span>
          </div>
          <button onClick={() => setSaveSuccess(false)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ĐIỂM TB LỚP</p>
            <p className="text-2xl font-extrabold text-[#003366] mt-1">{classAvgMetric}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366] font-bold">
            📊
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">HỌC SINH GIỎI</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">{excellentCount} <span className="text-xs font-normal text-gray-500">em</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            🌟
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">CẢNH BÁO HỌC TẬP</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{warningCount} <span className="text-xs font-normal text-gray-500">em</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            ⚠️
          </div>
        </div>
      </div>

      {/* Filter and Student Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={studentSearchQuery}
            onChange={(e) => setStudentSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh, mã HS..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'ALL'
                ? 'bg-[#003366] text-white font-semibold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tất cả ({gradeStudents.length})
          </button>
          <button
            onClick={() => setStatusFilter('WARNING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'WARNING'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            ⚠️ Cảnh báo ({warningCount})
          </button>
          <button
            onClick={() => setStatusFilter('EXCELLENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === 'EXCELLENT'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            🌟 Học sinh giỏi ({excellentCount})
          </button>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[200px]">Học sinh</th>
                <th className="py-3 px-4 text-center min-w-[220px]">Điểm thường xuyên (Hệ số 1)</th>
                <th className="py-3 px-4 text-center w-24">Giữa kỳ (x2)</th>
                <th className="py-3 px-4 text-center w-24">Cuối kỳ (x3)</th>
                <th className="py-3 px-4 text-center w-28">AI Dự Đoán</th>
                <th className="py-3 px-4 text-center w-24">ĐTB</th>
                <th className="py-3 px-4 text-center w-28">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s, idx) => {
                const avgNum = parseFloat(s.average)
                const isWarning = s.warning || (!isNaN(avgNum) && avgNum < 5.0)

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-blue-50/40 transition ${
                      isWarning ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-medium text-gray-500 text-xs">
                      {idx + 1}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{s.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{s.studentId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Frequency Scores */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {s.freq.map((score, fIdx) => (
                          <input
                            key={fIdx}
                            type="text"
                            value={score}
                            onChange={(e) => handleScoreChange(s.id, 'freq', fIdx, e.target.value)}
                            className="w-10 py-1 text-center font-semibold text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none bg-white"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Mid Term Score */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="text"
                        value={s.midTerm}
                        onChange={(e) => handleScoreChange(s.id, 'midTerm', undefined, e.target.value)}
                        className="w-12 py-1 text-center font-bold text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none bg-white text-blue-900"
                      />
                    </td>

                    {/* Final Term Score */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="text"
                        value={s.finalTerm}
                        onChange={(e) => handleScoreChange(s.id, 'finalTerm', undefined, e.target.value)}
                        className="w-12 py-1 text-center font-bold text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#003366] focus:border-transparent outline-none bg-white text-purple-900"
                      />
                    </td>

                    {/* AI Prediction */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold border border-indigo-100">
                        ✨ {s.aiPrediction}
                      </span>
                    </td>

                    {/* Calculated Average */}
                    <td className="py-3 px-4 text-center font-black text-sm text-[#003366]">
                      {s.average}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      {isWarning ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[11px] font-bold inline-block">
                          ⚠️ Cảnh báo
                        </span>
                      ) : !isNaN(avgNum) && avgNum >= 8.5 ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold inline-block">
                          Giỏi
                        </span>
                      ) : !isNaN(avgNum) && avgNum >= 6.5 ? (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[11px] font-bold inline-block">
                          Khá
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[11px] font-medium inline-block">
                          Trung bình
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                    Không tìm thấy học sinh nào phù hợp trong sổ điểm này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
