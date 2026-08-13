'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAcademic } from '@/lib/academic-context'
import { getClasses, getClassStudents, getTeachers, updateClass, addStudentToClass, removeStudentFromClass, createClass, deleteClass, getStudentsCount } from '@/lib/api'

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
  subject?: string
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
  const [totalStudentsAll, setTotalStudentsAll] = useState(0)

  // Modals – Create / Edit Class
  const [showClassModal, setShowClassModal] = useState(false)
  const [editingClass, setEditingClass] = useState<any | null>(null)
  const [classForm, setClassForm] = useState({ class_name: '', grade_level: '' })
  const [savingClass, setSavingClass] = useState(false)

  // Notification + confirm modals (replace native alert/confirm)
  const [notify, setNotify] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [confirmDeleteClass, setConfirmDeleteClass] = useState<any | null>(null)
  const [confirmMismatchAdd, setConfirmMismatchAdd] = useState<{ count: number; ids: number[] } | null>(null)
  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState<number | null>(null)

  // Filters & Search
  const [searchClassQuery, setSearchClassQuery] = useState('')
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL')
  const [studentSearchQuery, setStudentSearchQuery] = useState('')

  // Modals – Teacher
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('')
  const [isUpdatingTeacher, setIsUpdatingTeacher] = useState(false)
  const [showAllTeachers, setShowAllTeachers] = useState(false)  // false = chưa chủ nhiệm, true = tất cả

  // Modals – Add Student
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [isAddingStudent, setIsAddingStudent] = useState(false)
  const [studentModalTab, setStudentModalTab] = useState<'pick' | 'new'>('pick') // 'pick' = chọn từ danh sách, 'new' = nhập mới
  const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
  const [unassignedSearch, setUnassignedSearch] = useState('')
  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState<number[]>([])
  const [loadingUnassigned, setLoadingUnassigned] = useState(false)
  const [showAllStudents, setShowAllStudents] = useState(false) // true = tất cả, false = chưa có lớp
  const [newStudentForm, setNewStudentForm] = useState({
    full_name: '',
    student_code: '',
    gender: 'Nam',
    date_of_birth: '',
  })

  // Load Classes and Teachers list
  const { selectedSchoolYearId, currentSchoolYear } = useAcademic()

  // Birth-year rule: admission based on current school year start.
  // A student in grade G is expected to be born ~ (startYear - G - 5).
  // Late learners (born earlier) are allowed; only students who are too young
  // (born after the expected/admission year) are flagged as mismatched.
  const startYear = currentSchoolYear?.start_date
    ? new Date(currentSchoolYear.start_date).getFullYear()
    : new Date().getFullYear()
  const expectedBirthYear = (grade: number | null | undefined) => (grade ? startYear - grade - 5 : null)
  const birthYearOf = (dob?: string) =>
    dob ? new Date(dob).getFullYear() : null
  const isBirthYearMatch = (s: Student) => {
    const expected = expectedBirthYear((selectedClass as any)?.grade_level)
    const by = birthYearOf(s.date_of_birth)
    if (expected == null || by == null) return false
    return by <= expected
  }
  const birthYearNote = (s: Student) => {
    const expected = expectedBirthYear((selectedClass as any)?.grade_level)
    const by = birthYearOf(s.date_of_birth)
    if (by == null) return 'Chưa có ngày sinh'
    if (expected != null && by > expected) return `Sinh ${by} (lệch khối, cần ≤ ${expected})`
    return null
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getClasses({ limit: 50, schoolYearId: selectedSchoolYearId ?? undefined }).catch(() => null),
      getTeachers({ limit: 50 }).catch(() => null),
      getStudentsCount().catch(() => 0),
    ]).then(([classRes, teacherRes, totalStudents]) => {
      setTotalStudentsAll(totalStudents)
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
  }, [selectedSchoolYearId])

  // When class selected, fetch students
  const handleSelectClass = async (cls: any) => {
    setSelectedClass(cls)
    setSelectedTeacherId(cls.homeroom_teacher_id || null)
    setLoading(true)
    try {
      const res = await getClassStudents(cls.class_id)
      setStudents(res ?? [])
    } catch {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  // Open create class modal
  const openCreateClass = () => {
    setEditingClass(null)
    setClassForm({ class_name: '', grade_level: '' })
    setShowClassModal(true)
  }

  // Open edit class modal
  const openEditClass = (cls: any) => {
    setEditingClass(cls)
    setClassForm({
      class_name: cls.class_name || '',
      grade_level: cls.grade_level ? String(cls.grade_level) : '',
    })
    setShowClassModal(true)
  }

  // Save create/edit class
  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = classForm.class_name.trim()
    if (!name) return

    // Prevent duplicate class name (case-insensitive), excluding the one being edited.
    const duplicate = classes.find(c =>
      c.class_name?.toLowerCase() === name.toLowerCase() && c.class_id !== (editingClass?.class_id ?? null)
    )
    if (duplicate) {
      setNotify({ type: 'error', message: `Lớp "${duplicate.class_name}" đã tồn tại. Vui lòng chọn tên lớp khác.` })
      return
    }

    setSavingClass(true)
    try {
      const gradeNum = classForm.grade_level ? parseInt(classForm.grade_level, 10) : null
      if (editingClass) {
        const res = await updateClass(editingClass.class_id, {
          class_name: name,
          grade_level: gradeNum ?? undefined,
        })
        if (res?.error) {
          setNotify({ type: 'error', message: res.error })
          setSavingClass(false)
          return
        }
      } else {
        const res = await createClass({
          class_name: name,
          grade_level: gradeNum ?? undefined,
        })
        if (res?.error) {
          setNotify({ type: 'error', message: res.error })
          setSavingClass(false)
          return
        }
      }
      const classRes = await getClasses({ limit: 50, schoolYearId: selectedSchoolYearId ?? undefined })
      if (classRes?.data && classRes.data.length > 0) setClasses(classRes.data)
      setNotify({ type: 'success', message: editingClass ? `Đã cập nhật lớp ${name}` : `Đã thêm lớp ${name}` })
    } catch (err) {
      console.warn('Save class error', err)
      setNotify({ type: 'error', message: 'Lưu lớp thất bại!' })
    } finally {
      setSavingClass(false)
      setShowClassModal(false)
    }
  }

  // Delete class (opens confirm modal, then deletes)
  const handleDeleteClass = (cls: any) => {
    setConfirmDeleteClass(cls)
  }

  const confirmDelete = async () => {
    if (!confirmDeleteClass) return
    try {
      const res = await deleteClass(confirmDeleteClass.class_id)
      if (res?.error) {
        setNotify({ type: 'error', message: res.error })
        setConfirmDeleteClass(null)
        return
      }
      setClasses(prev => prev.filter(c => c.class_id !== confirmDeleteClass.class_id))
      setNotify({ type: 'success', message: `Đã xóa lớp ${confirmDeleteClass.class_name}` })
    } catch (err) {
      console.warn('Delete class error', err)
      setNotify({ type: 'error', message: 'Xóa lớp thất bại!' })
    }
    setConfirmDeleteClass(null)
  }

  // Confirm Teacher Change
  const handleSaveHomeroomTeacher = async () => {    if (!selectedClass) return
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
    setSelectedUnassignedIds([])
  }

  // Handle picking existing unassigned students into class
  const handleAddSelectedStudents = async () => {
    if (!selectedClass || selectedUnassignedIds.length === 0) return
    // If any selected student is younger than expected for this grade, ask to confirm.
    const mismatched = unassignedStudents.filter(
      s => selectedUnassignedIds.includes(s.student_id) && !isBirthYearMatch(s)
    )
    if (mismatched.length > 0) {
      setConfirmMismatchAdd({ count: mismatched.length, ids: selectedUnassignedIds })
      return
    }
    await performAddSelectedStudents(selectedUnassignedIds)
  }

  const performAddSelectedStudents = async (ids: number[]) => {
    if (!selectedClass || ids.length === 0) return
    setIsAddingStudent(true)
    const toAdd = unassignedStudents.filter(s => ids.includes(s.student_id))
    try {
      await Promise.all(
        toAdd.map(s =>
          addStudentToClass(selectedClass.class_id, {
            student_id: s.student_id,
            full_name: s.full_name,
            student_code: s.student_code,
            gender: s.gender,
            date_of_birth: s.date_of_birth,
          })
        )
      )
    } catch (e) {
      console.warn('Add students fallback to local', e)
    }
    // Add to local students list
    setStudents(prev => [...toAdd.map(s => ({ ...s, status: 'Đang học' })), ...prev])
    // Remove from unassigned list
    setUnassignedStudents(prev => prev.filter(s => !ids.includes(s.student_id)))
    // Update count
    const updatedCount = (selectedClass.student_count || students.length) + toAdd.length
    const updatedClass = { ...selectedClass, student_count: updatedCount }
    setSelectedClass(updatedClass)
    setClasses(prev => prev.map(c => c.class_id === selectedClass.class_id ? updatedClass : c))
    setIsAddingStudent(false)
    setShowAddStudentModal(false)
    setSelectedUnassignedIds([])
  }

  // Open add student modal and load unassigned students
  const openAddStudentModal = async () => {
    setStudentModalTab('pick')
    setUnassignedSearch('')
    setSelectedUnassignedIds([])
    setShowAllStudents(false)
    setShowAddStudentModal(true)
    setLoadingUnassigned(true)
    try {
      // Get all students (limit high) then filter those without class
      const { getStudents } = await import('@/lib/api')
      const res = await getStudents({ limit: 500 })
      const all: Student[] = (res.data || []).map((s: any) => ({
        student_id: s.student_id ?? s.user_id,
        student_code: s.student_code || '',
        full_name: s.full_name || s.username || '',
        gender: s.gender || 'Nam',
        date_of_birth: s.date_of_birth || '',
        status: s.status || 'Đang học',
        class_id: s.class_id,
        class_name: s.class_name,
      }))
      // Exclude students already in current class
      const currentIds = new Set(students.map(s => s.student_id))
      setUnassignedStudents(all.filter(s => !currentIds.has(s.student_id)))
    } catch {
      setUnassignedStudents([])
    } finally {
      setLoadingUnassigned(false)
    }
  }


  // Handle Remove Student
  const handleRemoveStudent = async (studentId: number) => {
    if (selectedClass) {
      try {
        await removeStudentFromClass(selectedClass.class_id, studentId)
      } catch (e) {
        console.warn('Failed to remove student on backend', e)
      }
    }
    setStudents(prev => prev.filter(s => s.student_id !== studentId))
    if (selectedClass) {
      const updatedCount = Math.max(0, (selectedClass.student_count || students.length) - 1)
      const updatedClass = { ...selectedClass, student_count: updatedCount }
      setSelectedClass(updatedClass)
      setClasses(prev => prev.map(c => c.class_id === selectedClass.class_id ? updatedClass : c))
    }
  }

  const confirmRemoveStudentAction = async () => {
    if (confirmRemoveStudent == null) return
    const id = confirmRemoveStudent
    setConfirmRemoveStudent(null)
    await handleRemoveStudent(id)
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

  // Filtered Teachers in modal: default chỉ GV chưa chủ nhiệm lớp nào, toggle showAll
  const assignedTeacherIds = useMemo(
    () => new Set(classes.filter(c => c.homeroom_teacher_id && c.class_id !== selectedClass?.class_id).map(c => c.homeroom_teacher_id)),
    [classes, selectedClass]
  )

  const filteredModalTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch =
        !teacherSearchQuery ||
        t.full_name?.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
        t.teacher_code?.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
        t.department?.toLowerCase().includes(teacherSearchQuery.toLowerCase())
      const matchAssigned = showAllTeachers || !assignedTeacherIds.has(t.teacher_id)
      return matchSearch && matchAssigned
    })
  }, [teachers, teacherSearchQuery, showAllTeachers, assignedTeacherIds])


  // ---------------------------------------------------------------------------
  // STEP 1: CLASS SELECTION GRID VIEW
  // ---------------------------------------------------------------------------
  if (!selectedClass) {
    const totalStudentsSum = classes.reduce((sum, c) => sum + (c.student_count || 0), 0)
    const assignedTeachersCount = classes.filter(c => !!c.homeroom_teacher_name).length
    const unassignedStudentsCount = Math.max(0, totalStudentsAll - totalStudentsSum)

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

        <button
          onClick={openCreateClass}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm Lớp Mới
        </button>

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
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{totalStudentsSum} <span className="text-xs font-normal text-gray-500">/ {totalStudentsAll} em</span></p>
              {unassignedStudentsCount > 0 && (
                <p className="text-[11px] font-semibold text-red-600 mt-1">Còn {unassignedStudentsCount} học sinh chưa có lớp</p>
              )}
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
            <div className="relative flex-1 max-w-2xl">
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
                className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
              <button
                onClick={() => setSelectedGradeFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedGradeFilter === 'ALL'
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Tất cả các khối
              </button>
              {['6', '7', '8', '9'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGradeFilter(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${selectedGradeFilter === g
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
                          <div>
                            <div className="text-xs font-bold text-gray-900">{cls.homeroom_teacher_name}</div>
                            {(() => {
                              const ht = teachers.find(t => t.teacher_id === cls.homeroom_teacher_id)
                              return ht?.subject ? (
                                <div className="text-[10px] text-gray-500">Bộ môn: {ht.subject}</div>
                              ) : null
                            })()}
                          </div>
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
                    <span className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditClass(cls) }}
                        className="px-2 py-1 text-[11px] rounded-md text-blue-600 hover:bg-blue-50 font-semibold transition"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClass(cls) }}
                        className="px-2 py-1 text-[11px] rounded-md text-red-600 hover:bg-red-50 font-semibold transition"
                      >
                        Xóa
                      </button>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* MODAL: CREATE / EDIT CLASS */}
        {showClassModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowClassModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#003366] to-[#0055a5] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{editingClass ? 'Sửa Thông Tin Lớp' : 'Thêm Lớp Mới'}</h3>
                  <p className="text-xs text-blue-200 mt-0.5">Năm học hiện tại</p>
                </div>
                <button onClick={() => setShowClassModal(false)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
              </div>
              <form onSubmit={handleSaveClass} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Khối Lớp</label>
                  <select
                    value={classForm.grade_level}
                    onChange={e => setClassForm({ ...classForm, grade_level: e.target.value })}
                    className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none bg-white cursor-pointer"
                  >
                    <option value="">-- Chọn khối --</option>
                    {['6', '7', '8', '9'].map(g => (
                      <option key={g} value={g}>Khối {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Tên Lớp <span className="text-red-500">*</span></label>
                  <input
                    type="text" required
                    value={classForm.class_name}
                    onChange={e => setClassForm({ ...classForm, class_name: e.target.value })}
                    placeholder="Ví dụ: 9C"
                    className="w-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
                  />
                </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowClassModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
                  <button
                    type="submit"
                    disabled={savingClass || !classForm.class_name.trim()}
                    className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingClass ? 'Đang lưu...' : (editingClass ? 'Cập Nhật Lớp' : 'Thêm Lớp')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NOTIFICATION MODAL */}
        {notify && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setNotify(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
              <div className={`px-6 py-4 flex items-center gap-3 ${notify.type === 'error' ? 'bg-red-50' : notify.type === 'success' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                <span className={`text-2xl ${notify.type === 'error' ? 'text-red-500' : notify.type === 'success' ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {notify.type === 'error' ? '✕' : notify.type === 'success' ? '✓' : 'ℹ'}
                </span>
                <h3 className={`text-sm font-bold ${notify.type === 'error' ? 'text-red-700' : notify.type === 'success' ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {notify.type === 'error' ? 'Thông báo lỗi' : notify.type === 'success' ? 'Thành công' : 'Thông báo'}
                </h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700">{notify.message}</p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setNotify(null)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold text-white transition ${notify.type === 'error' ? 'bg-red-600 hover:bg-red-700' : notify.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE CLASS MODAL */}
        {confirmDeleteClass && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDeleteClass(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Xóa Lớp</h3>
                  <p className="text-xs text-red-100 mt-0.5">Lớp: {confirmDeleteClass.class_name}</p>
                </div>
                <button onClick={() => setConfirmDeleteClass(null)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700">
                  Bạn có chắc chắn muốn xóa lớp <span className="font-bold">{confirmDeleteClass.class_name}</span> không? Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setConfirmDeleteClass(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
                <button onClick={confirmDelete} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">Xóa Lớp</button>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM ADD MISMATCHED (birth-year) STUDENTS */}
        {confirmMismatchAdd && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmMismatchAdd(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-400 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Cảnh Báo Năm Sinh</h3>
                  <p className="text-xs text-amber-100 mt-0.5">Khối {selectedClass?.grade_level || ''} · Năm học {startYear}-{startYear + 1}</p>
                </div>
                <button onClick={() => setConfirmMismatchAdd(null)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700">
                  Có <span className="font-bold">{confirmMismatchAdd.count}</span> học sinh được chọn có <span className="font-semibold">năm sinh trẻ hơn chuẩn</span> của khối
                  <span className="font-bold"> {selectedClass?.grade_level || ''}</span> (cần sinh ≤ {expectedBirthYear((selectedClass as any)?.grade_level)}).
                  Bạn vẫn muốn thêm những học sinh này vào lớp <span className="font-bold">{selectedClass?.class_name}</span> không?
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setConfirmMismatchAdd(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy Bỏ</button>
                <button
                  onClick={() => {
                    const ids = confirmMismatchAdd.ids
                    setConfirmMismatchAdd(null)
                    performAddSelectedStudents(ids)
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  Vẫn Thêm Học Sinh
                </button>
              </div>
            </div>
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
              onClick={openAddStudentModal}
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
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
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
                      onClick={() => setConfirmRemoveStudent(s.student_id)}
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

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: SELECT / CHANGE HOMEROOM TEACHER */}
      {/* ----------------------------------------------------------------- */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTeacherModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#003366] to-[#0055a5] text-white">
              <div>
                <h3 className="text-lg font-bold">Chọn Giáo Viên Chủ Nhiệm</h3>
                <p className="text-xs text-blue-200 mt-0.5">Lớp: {selectedClass?.class_name} · {selectedClass?.grade_name || `Khối ${selectedClass?.grade_level || ''}`}</p>
              </div>
              <button onClick={() => setShowTeacherModal(false)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
            </div>

            {/* Search + Toggle */}
            <div className="px-6 py-4 border-b border-gray-100 space-y-3 bg-gray-50">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                  type="text"
                  value={teacherSearchQuery}
                  onChange={e => setTeacherSearchQuery(e.target.value)}
                  placeholder="Tìm tên giáo viên, mã GV, bộ môn..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none bg-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {filteredModalTeachers.length} giáo viên{showAllTeachers ? ' (tất cả)' : ' chưa chủ nhiệm'}
                </span>
                <button
                  onClick={() => setShowAllTeachers(p => !p)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${showAllTeachers
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-blue-50 text-[#003366] border-blue-200'
                    }`}
                >
                  {showAllTeachers ? '⚠ Đang hiện tất cả GV' : '✓ Chỉ GV chưa chủ nhiệm'}
                </button>
              </div>
            </div>

            {/* Teacher List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {filteredModalTeachers.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-sm font-medium">Không tìm thấy giáo viên phù hợp</p>
                  <button onClick={() => setShowAllTeachers(true)} className="text-xs text-[#003366] underline mt-1">Hiện tất cả giáo viên</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredModalTeachers.map(t => {
                    const isSelected = selectedTeacherId === t.teacher_id
                    const isAlreadyAssigned = assignedTeacherIds.has(t.teacher_id)
                    return (
                      <div
                        key={t.teacher_id}
                        onClick={() => setSelectedTeacherId(t.teacher_id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${isSelected
                          ? 'border-[#003366] bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-[#003366] text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {t.full_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate">{t.full_name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {t.subject ? `Bộ môn: ${t.subject}` : (t.department || 'Giáo viên')} · {t.teacher_code || '—'}
                          </div>
                          {isAlreadyAssigned && (
                            <span className="text-[10px] text-amber-600 font-semibold">Đang chủ nhiệm lớp khác</span>
                          )}
                        </div>
                        <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#003366] bg-[#003366]' : 'border-gray-300'
                          }`}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {selectedTeacherId
                  ? `Đã chọn: ${teachers.find(t => t.teacher_id === selectedTeacherId)?.full_name || ''}`
                  : 'Chưa chọn giáo viên'}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowTeacherModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
                <button
                  onClick={handleSaveHomeroomTeacher}
                  disabled={isUpdatingTeacher || !selectedTeacherId}
                  className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUpdatingTeacher ? (
                    <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" /></svg>Đang lưu...</>
                  ) : 'Xác Nhận Cập Nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: ADD STUDENT TO CLASS */}
      {/* ----------------------------------------------------------------- */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddStudentModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-emerald-500 text-white">
              <div>
                <h3 className="text-lg font-bold">Thêm Học Sinh Vào Lớp</h3>
                <p className="text-xs text-emerald-100 mt-0.5">Lớp: {selectedClass?.class_name} · {selectedClass?.grade_name || `Khối ${selectedClass?.grade_level || ''}`}</p>
              </div>
              <button onClick={() => setShowAddStudentModal(false)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setStudentModalTab('pick')}
                className={`flex-1 py-3.5 text-sm font-semibold transition border-b-2 ${studentModalTab === 'pick' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                📋 Chọn từ danh sách học sinh
              </button>
              <button
                onClick={() => setStudentModalTab('new')}
                className={`flex-1 py-3.5 text-sm font-semibold transition border-b-2 ${studentModalTab === 'new' ? 'border-emerald-600 text-emerald-700 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                ✏️ Nhập học sinh mới
              </button>
            </div>

            {/* TAB: Chọn từ danh sách */}
            {studentModalTab === 'pick' && (
              <>
                {/* Search + Toggle */}
                <div className="px-6 py-4 border-b border-gray-100 space-y-3 bg-gray-50">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                      type="text"
                      value={unassignedSearch}
                      onChange={e => setUnassignedSearch(e.target.value)}
                      placeholder="Tìm tên học sinh, mã học sinh..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {selectedUnassignedIds.length > 0 ? `Đã chọn ${selectedUnassignedIds.length} học sinh` : 'Chưa chọn học sinh nào'}
                      </span>
                      {selectedUnassignedIds.length > 0 && (
                        <button onClick={() => setSelectedUnassignedIds([])} className="text-xs text-red-500 underline">Bỏ chọn tất cả</button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAllStudents(p => !p)}
                      className={`text-xs font-semibold px-3 py-1 rounded-full border transition ${showAllStudents
                        ? 'bg-amber-100 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                    >
                      {showAllStudents ? '⚠ Hiện tất cả HS' : '✓ Chỉ HS chưa có lớp'}
                    </button>
                  </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {loadingUnassigned ? (
                    <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-3">
                      <svg className="w-8 h-8 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" /></svg>
                      <span className="text-sm">Đang tải danh sách học sinh...</span>
                    </div>
                  ) : (() => {
                    const displayed = unassignedStudents.filter(s => {
                      const matchSearch = !unassignedSearch ||
                        s.full_name?.toLowerCase().includes(unassignedSearch.toLowerCase()) ||
                        s.student_code?.toLowerCase().includes(unassignedSearch.toLowerCase())
                      const matchFilter = showAllStudents || !(s as any).class_id
                      return matchSearch && matchFilter
                    })
                    return displayed.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="text-sm font-medium">Không có học sinh phù hợp</p>
                        <button onClick={() => setShowAllStudents(true)} className="text-xs text-emerald-600 underline mt-1">Hiện tất cả học sinh</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {displayed.map(s => {
                          const isSelected = selectedUnassignedIds.includes(s.student_id)
                          const hasClass = !!(s as any).class_id
                          const byMatch = isBirthYearMatch(s)
                          const byNote = birthYearNote(s)
                          return (
                            <div
                              key={s.student_id}
                              onClick={() => setSelectedUnassignedIds(prev =>
                                isSelected ? prev.filter(id => id !== s.student_id) : [...prev, s.student_id]
                              )}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${isSelected
                                ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                } ${!byMatch ? 'opacity-70' : ''}`}
                            >
                              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {s.full_name?.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-gray-900 truncate">{s.full_name}</div>
                                <div className="text-xs text-gray-500">{s.student_code || '—'} · {s.gender}</div>
                                {hasClass && (
                                  <span className="text-[10px] text-amber-600 font-semibold">Đang ở lớp {(s as any).class_name}</span>
                                )}
                                {!byMatch && byNote && (
                                  <span className="inline-block text-[10px] text-red-600 font-semibold bg-red-50 border border-red-200 rounded-full px-2 py-0.5 mt-1">⚠ {byNote}</span>
                                )}
                              </div>
                              <div className={`w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                }`}>
                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>

                {/* Footer pick */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-500">{selectedUnassignedIds.length} học sinh được chọn để thêm vào lớp</span>
                  <div className="flex gap-3">
                    <button onClick={() => setShowAddStudentModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
                    <button
                      onClick={handleAddSelectedStudents}
                      disabled={isAddingStudent || selectedUnassignedIds.length === 0}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAddingStudent ? 'Đang thêm...' : `Thêm ${selectedUnassignedIds.length || ''} Học Sinh`}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB: Nhập học sinh mới */}
            {studentModalTab === 'new' && (
              <form onSubmit={handleAddStudentSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="max-w-2xl mx-auto space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Họ tên */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Họ Và Tên Học Sinh <span className="text-red-500">*</span></label>
                        <input
                          type="text" required
                          value={newStudentForm.full_name}
                          onChange={e => setNewStudentForm({ ...newStudentForm, full_name: e.target.value })}
                          placeholder="Ví dụ: Nguyễn Văn A"
                          className="w-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      {/* Mã HS */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Mã Học Sinh</label>
                        <input
                          type="text"
                          value={newStudentForm.student_code}
                          onChange={e => setNewStudentForm({ ...newStudentForm, student_code: e.target.value })}
                          placeholder="Tự động tạo nếu bỏ trống"
                          className="w-full px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      {/* Giới tính */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Giới Tính</label>
                        <select
                          value={newStudentForm.gender}
                          onChange={e => setNewStudentForm({ ...newStudentForm, gender: e.target.value })}
                          className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                      {/* Ngày sinh */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Ngày Sinh</label>
                        <input
                          type="date"
                          value={newStudentForm.date_of_birth}
                          onChange={e => setNewStudentForm({ ...newStudentForm, date_of_birth: e.target.value })}
                          className="w-full px-4 py-3 text-sm text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Footer new */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddStudentModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
                  <button type="submit" disabled={isAddingStudent} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2">
                    {isAddingStudent ? 'Đang thêm...' : 'Thêm Vào Lớp'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONFIRM REMOVE STUDENT MODAL */}
      {confirmRemoveStudent != null && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmRemoveStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-red-500 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Gỡ Học Sinh</h3>
                <p className="text-xs text-red-100 mt-0.5">Lớp: {selectedClass?.class_name}</p>
              </div>
              <button onClick={() => setConfirmRemoveStudent(null)} className="text-white/70 hover:text-white text-xl leading-none font-bold">✕</button>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Bạn có chắc chắn muốn <span className="font-bold">gỡ học sinh này khỏi lớp</span> {selectedClass?.class_name} không?
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setConfirmRemoveStudent(null)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-semibold transition">Hủy bỏ</button>
              <button onClick={confirmRemoveStudentAction} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">Gỡ Khỏi Lớp</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

