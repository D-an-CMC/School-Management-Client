'use client'

import { useState, useEffect, useMemo } from 'react'
import { getClasses, getClassStudents, getTeachers, updateClass, addStudentToClass } from '@/lib/api'

interface Student {
  student_id: number
  student_code: string
  full_name: string
  gender: string
  date_of_birth?: string
  status?: string
}

interface Teacher {
  teacher_id: number
  full_name: string
  teacher_code?: string
  department?: string
  email?: string
  phone?: string
}

const INITIAL_MOCK_CLASSES = [
  { class_id: 1, class_name: 'Lớp 10A1', grade_name: 'Khối 10', grade_level: 10, homeroom_teacher_id: 1, homeroom_teacher_name: 'Trần Hoàng Nam', student_count: 38 },
  { class_id: 2, class_name: 'Lớp 11B2', grade_name: 'Khối 11', grade_level: 11, homeroom_teacher_id: 2, homeroom_teacher_name: 'Nguyễn Thị Minh', student_count: 42 },
  { class_id: 3, class_name: 'Lớp 12C3', grade_name: 'Khối 12', grade_level: 12, homeroom_teacher_id: 3, homeroom_teacher_name: 'Phạm Đức Anh', student_count: 40 },
  { class_id: 4, class_name: 'Lớp 9A2', grade_name: 'Khối 9', grade_level: 9, homeroom_teacher_id: null, homeroom_teacher_name: '', student_count: 36 },
  { class_id: 5, class_name: 'Lớp 8A1', grade_name: 'Khối 8', grade_level: 8, homeroom_teacher_id: 4, homeroom_teacher_name: 'Đặng Quốc Bảo', student_count: 35 },
  { class_id: 6, class_name: 'Lớp 7A3', grade_name: 'Khối 7', grade_level: 7, homeroom_teacher_id: 5, homeroom_teacher_name: 'Vũ Hải Yến', student_count: 39 },
]

const INITIAL_MOCK_TEACHERS: Teacher[] = [
  { teacher_id: 1, full_name: 'Trần Hoàng Nam', teacher_code: 'GV001', department: 'Tổ Toán', email: 'nam.th@cmc.edu.vn', phone: '0912 345 678' },
  { teacher_id: 2, full_name: 'Nguyễn Thị Minh', teacher_code: 'GV002', department: 'Tổ Văn', email: 'minh.nt@cmc.edu.vn', phone: '0912 345 679' },
  { teacher_id: 3, full_name: 'Phạm Đức Anh', teacher_code: 'GV003', department: 'Tổ Ngoại Ngữ', email: 'anh.pd@cmc.edu.vn', phone: '0912 345 680' },
  { teacher_id: 4, full_name: 'Đặng Quốc Bảo', teacher_code: 'GV004', department: 'Tổ Vật Lý', email: 'bao.dq@cmc.edu.vn', phone: '0912 345 681' },
  { teacher_id: 5, full_name: 'Vũ Hải Yến', teacher_code: 'GV005', department: 'Tổ Hóa Học', email: 'yen.vh@cmc.edu.vn', phone: '0912 345 682' },
  { teacher_id: 6, full_name: 'Hoàng Quốc Việt', teacher_code: 'GV006', department: 'Tổ Sinh Học', email: 'viet.hq@cmc.edu.vn', phone: '0912 345 683' },
  { teacher_id: 7, full_name: 'Bùi Thị Hà', teacher_code: 'GV007', department: 'Tổ Lịch Sử', email: 'ha.bt@cmc.edu.vn', phone: '0912 345 684' },
]

const INITIAL_MOCK_STUDENTS: Student[] = [
  { student_id: 101, student_code: 'HS2024001', full_name: 'Lê Hải Nam', gender: 'Nam', date_of_birth: '2010-05-14', status: 'Đang học' },
  { student_id: 102, student_code: 'HS2024002', full_name: 'Nguyễn Anh Thư', gender: 'Nữ', date_of_birth: '2010-08-22', status: 'Đang học' },
  { student_id: 103, student_code: 'HS2024003', full_name: 'Quách Gia Huy', gender: 'Nam', date_of_birth: '2010-11-03', status: 'Đang học' },
  { student_id: 104, student_code: 'HS2024004', full_name: 'Trần Bảo Minh', gender: 'Nam', date_of_birth: '2010-01-19', status: 'Đang học' },
  { student_id: 105, student_code: 'HS2024005', full_name: 'Phạm Phương Thảo', gender: 'Nữ', date_of_birth: '2010-04-30', status: 'Đang học' },
  { student_id: 106, student_code: 'HS2024006', full_name: 'Đỗ Tuấn Kiệt', gender: 'Nam', date_of_birth: '2010-09-12', status: 'Đang học' },
]

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<any | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchClassQuery, setSearchClassQuery] = useState('')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

  // Modals
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('')
  const [isUpdatingTeacher, setIsUpdatingTeacher] = useState(false)

  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [newStudentForm, setNewStudentForm] = useState({
    full_name: '',
    student_code: '',
    gender: 'Nam',
    date_of_birth: '',
  })

  // Load Classes and Teachers list
  useEffect(() => {
    setLoading(true)
    Promise.all([
      getClasses({ limit: 50 }).catch(() => null),
      getTeachers({ limit: 50 }).catch(() => null),
    ]).then(([classRes, teacherRes]) => {
      if (classRes?.data && classRes.data.length > 0) {
        setClasses(classRes.data)
      } else {
        setClasses(INITIAL_MOCK_CLASSES)
      }

      if (teacherRes?.data && teacherRes.data.length > 0) {
        setTeachers(teacherRes.data)
      } else {
        setTeachers(INITIAL_MOCK_TEACHERS)
      }
    }).finally(() => {
      setLoading(false)
    })
  }, [])

  // When class selected, fetch students
  const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls)
    setSelectedTeacherId(cls.homeroom_teacher_id || null)
    setLoading(true)
    try {
      const res = await getClassStudents(cls.class_id)
      if (res && res.length > 0) {
        setStudents(res)
      } else {
        setStudents(INITIAL_MOCK_STUDENTS)
      }
    } catch {
      setStudents(INITIAL_MOCK_STUDENTS)
    } finally {
      setLoading(false)
    }
  }

  // Confirm Teacher Change
  const handleSaveHomeroomTeacher = async () => {
    if (!selectedClass) return
    setIsUpdatingTeacher(true)

    const teacherObj = teachers.find(t => t.teacher_id === selectedTeacherId)
    const teacherName = teacherObj ? teacherObj.full_name : ''

    try {
      await updateClass(selectedClass.class_id, {
        homeroom_teacher_id: selectedTeacherId,
      })
    } catch (e) {
      console.warn('Backend update teacher fallback to local state', e)
    }

    // Update local states
    const updatedClass = {
      ...selectedClass,
      homeroom_teacher_id: selectedTeacherId,
      homeroom_teacher_name: teacherName,
    }
    setSelectedClass(updatedClass)

    setClasses(prev =>
      prev.map(c => c.class_id === selectedClass.class_id ? updatedClass : c)
    )

    setIsUpdatingTeacher(false)
    setShowTeacherModal(false)
  }

  // Handle Add Student
  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !newStudentForm.full_name.trim()) return

    setIsAddingStudent(true)
    const code = newStudentForm.student_code.trim() || `HS${Date.now().toString().slice(-6)}`

    try {
      const res = await addStudentToClass(selectedClass.class_id, {
        full_name: newStudentForm.full_name,
        student_code: code,
        gender: newStudentForm.gender,
        date_of_birth: newStudentForm.date_of_birth,
      })

      if (res?.data) {
        setStudents(prev => [res.data, ...prev])
      } else {
        const newStud: Student = {
          student_id: Date.now(),
          student_code: code,
          full_name: newStudentForm.full_name,
          gender: newStudentForm.gender,
          date_of_birth: newStudentForm.date_of_birth,
          status: 'Đang học',
        }
        setStudents(prev => [newStud, ...prev])
      }
    } catch {
      const newStud: Student = {
        student_id: Date.now(),
        student_code: code,
        full_name: newStudentForm.full_name,
        gender: newStudentForm.gender,
        date_of_birth: newStudentForm.date_of_birth,
        status: 'Đang học',
      }
      setStudents(prev => [newStud, ...prev])
    }

    // Update student count on selected class
    const updatedCount = (selectedClass.student_count || students.length) + 1
    const updatedClass = { ...selectedClass, student_count: updatedCount }
    setSelectedClass(updatedClass)
    setClasses(prev => prev.map(c => c.class_id === selectedClass.class_id ? updatedClass : c))

    setIsAddingStudent(false)
    setShowAddStudentModal(false)
    setNewStudentForm({ full_name: '', student_code: '', gender: 'Nam', date_of_birth: '' })
  }

  // Handle Remove Student
  const handleRemoveStudent = (studentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn gỡ học sinh này khỏi lớp không?')) return
    setStudents(prev => prev.filter(s => s.student_id !== studentId))
    if (selectedClass) {
      const updatedCount = Math.max(0, (selectedClass.student_count || students.length) - 1)
      const updatedClass = { ...selectedClass, student_count: updatedCount }
      setSelectedClass(updatedClass)
      setClasses(prev => prev.map(c => c.class_id === selectedClass.class_id ? updatedClass : c))
    }
  }

  // Filtered Classes list
  const filteredClasses = useMemo(() => {
    return classes.filter(cls => {
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

  // Filtered Students in class detail
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      return (
        !studentSearchQuery ||
        s.full_name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        s.student_code?.toLowerCase().includes(studentSearchQuery.toLowerCase())
      )
    })
  }, [students, studentSearchQuery])

  // Filtered Teachers in modal
  const filteredModalTeachers = useMemo(() => {
    return teachers.filter(t => {
      return (
        !teacherSearchQuery ||
        t.full_name?.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
        t.teacher_code?.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
        t.department?.toLowerCase().includes(teacherSearchQuery.toLowerCase())
      )
    })
  }, [teachers, teacherSearchQuery])

  // ---------------------------------------------------------------------------
  // STEP 1: CLASS SELECTION GRID VIEW
  // ---------------------------------------------------------------------------
  if (!selectedClass) {
    const totalStudentsSum = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)
    const assignedTeachersCount = classes.filter(c => !!c.homeroom_teacher_name).length

    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-[#003366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Quản Lý Lớp Học
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            Chọn lớp học để quản lý Giáo viên chủ nhiệm và danh sách học sinh
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">TỔNG SỐ LỚP</p>
              <p className="text-2xl font-extrabold text-[#003366] mt-1">{classes.length} <span className="text-xs font-normal text-gray-500">lớp</span></p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366] font-bold">
              🏫
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">TỔNG SỐ HỌC SINH</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{totalStudentsSum} <span className="text-xs font-normal text-gray-500">em</span></p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
              👨‍🎓
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase">ĐÃ CÓ GVCN</p>
              <p className="text-2xl font-extrabold text-purple-600 mt-1">{assignedTeachersCount} / {classes.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
              👩‍🏫
            </div>
          </div>
        </div>

        {/* Search & Grade Level Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
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
                placeholder="Tìm tên lớp, GVCN..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

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
            Không tìm thấy lớp học nào
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredClasses.map((cls) => {
              const hasTeacher = !!cls.homeroom_teacher_name

              return (
                <div
                  key={cls.class_id}
                  onClick={() => handleSelectClass(cls)}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#003366] group-hover:bg-blue-600 transition-colors"></div>

                  <div>
                    <div className="flex items-start justify-between mb-3 pt-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#003366] transition-colors">
                          {cls.class_name}
                        </h3>
                        <span className="text-xs font-medium text-gray-500">
                          {cls.grade_name || `Khối ${cls.grade_level || ''}`}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 bg-blue-50 text-[#003366] rounded-md font-bold text-xs border border-blue-100">
                        {cls.student_count || 0} Học sinh
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 my-3 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">GIÁO VIÊN CHỦ NHIỆM</p>
                      {hasTeacher ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-bold">
                            {cls.homeroom_teacher_name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-900">{cls.homeroom_teacher_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          ⚠️ Chưa phân công
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#003366]">
                    <span>Quản lý danh sách & GVCN</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
  // STEP 2: CLASS DETAIL VIEW (Selected Class)
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => setSelectedClass(null)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#003366] bg-white border border-gray-200 px-3 py-1.5 rounded-lg mb-4 hover:bg-gray-50 transition shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại danh sách lớp
      </button>

      {/* Class Title Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900">{selectedClass.class_name}</h1>
              <span className="px-3 py-1 bg-blue-100 text-[#003366] rounded-full text-xs font-bold">
                {selectedClass.grade_name || `Khối ${selectedClass.grade_level || ''}`}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Năm học 2025 - 2026 • Trường THCS CMC</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Thêm Học Sinh Vào Lớp
            </button>
          </div>
        </div>

        {/* Homeroom Teacher Info Box */}
        <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {selectedClass.homeroom_teacher_name ? selectedClass.homeroom_teacher_name.charAt(0) : '?'}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GIÁO VIÊN CHỦ NHIỆM</p>
              {selectedClass.homeroom_teacher_name ? (
                <h3 className="text-base font-bold text-gray-900">{selectedClass.homeroom_teacher_name}</h3>
              ) : (
                <span className="text-xs font-semibold text-amber-600">Chưa được phân công</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowTeacherModal(true)}
            className="px-4 py-2 bg-white border border-[#003366] text-[#003366] hover:bg-blue-50 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {selectedClass.homeroom_teacher_name ? 'Thay Đổi GVCN' : 'Chọn GVCN'}
          </button>
        </div>
      </div>

      {/* Student List Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Danh Sách Học Sinh Trong Lớp</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tổng số: {students.length} học sinh</p>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc mã học sinh..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-32">Mã Học Sinh</th>
                <th className="py-3 px-4">Họ Và Tên</th>
                <th className="py-3 px-4 w-24">Giới Tính</th>
                <th className="py-3 px-4 w-32">Ngày Sinh</th>
                <th className="py-3 px-4 w-28 text-center">Trạng Thái</th>
                <th className="py-3 px-4 w-24 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((s, idx) => (
                <tr key={s.student_id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-gray-700">{s.student_code}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-[#003366] flex items-center justify-center font-bold text-xs">
                        {s.full_name?.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{s.gender || 'Nam'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-semibold border border-emerald-200">
                      Đang học
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleRemoveStudent(s.student_id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
                      title="Gỡ khỏi lớp"
                    >
                      Gỡ khỏi lớp
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    Chưa có học sinh nào trong lớp này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1: SELECT / CHANGE HOMEROOM TEACHER */}
      {/* --------------------------------------------------------------------- */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-base font-bold text-gray-900">Chọn Giáo Viên Chủ Nhiệm</h3>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Teacher Search */}
              <input
                type="text"
                value={teacherSearchQuery}
                onChange={(e) => setTeacherSearchQuery(e.target.value)}
                placeholder="Tìm tên giáo viên, mã GV, bộ môn..."
                className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
              />

              {/* Teacher List Options */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredModalTeachers.map((t) => {
                  const isSelected = selectedTeacherId === t.teacher_id

                  return (
                    <div
                      key={t.teacher_id}
                      onClick={() => setSelectedTeacherId(t.teacher_id)}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#003366] bg-blue-50/60 ring-2 ring-[#003366]'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
                          {t.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs md:text-sm text-gray-900">{t.full_name}</div>
                          <div className="text-[11px] text-gray-500">{t.department || 'Giáo viên'} • {t.teacher_code || ''}</div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'border-[#003366] bg-[#003366] text-white' : 'border-gray-300'
                      }`}>
                        {isSelected && '✓'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTeacherModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveHomeroomTeacher}
                disabled={isUpdatingTeacher}
                className="px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingTeacher ? 'Đang lưu...' : 'Xác Nhận Cập Nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2: ADD STUDENT TO CLASS */}
      {/* --------------------------------------------------------------------- */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-base font-bold text-gray-900">Thêm Học Sinh Vào Lớp {selectedClass.class_name}</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Họ Và Tên Học Sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStudentForm.full_name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })}
                  placeholder="Ví dụ: Nguyen Van A"
                  className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Mã Học Sinh (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={newStudentForm.student_code}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, student_code: e.target.value })}
                  placeholder="Bỏ trống để tự động tạo (VD: HS202601)"
                  className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Giới Tính
                  </label>
                  <select
                    value={newStudentForm.gender}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    value={newStudentForm.date_of_birth}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-xs font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAddingStudent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isAddingStudent ? 'Đang thêm...' : 'Thêm Vào Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
