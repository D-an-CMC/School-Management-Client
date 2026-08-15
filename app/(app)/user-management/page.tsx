'use client'

import { useEffect, useMemo, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'
import {
  getUsers,
  getStudents,
  getTeachers,
  updateUser,
  deleteUser,
  getClasses,
  createUser,
  getStudentCodePreview,
  getSchoolYears,
  getStudentStats,
  getTeacherStats,
  getGradeStats,
  getSubjects,
  getDepartments,
  getTeacherCodePreview
} from '@/lib/api'

interface UserRow {
  user_id: number
  email: string
  username: string
  phone?: string
  is_active: boolean
  role_id?: number
  role_name?: string
  class_name?: string
  class_id?: number
  grade_level?: number
  full_name?: string
  student_code?: string
  gender?: string
  date_of_birth?: string
  department?: string
  subject?: string
  title?: string
  emergency_phone?: string
  schedule_slot?: string
  address?: string
  enrollment_date?: string
  parent_full_name?: string
  parent_phone?: string
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const { currentSchoolYear } = useAcademic()
  const [allUsers, setAllUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [roles, setRoles] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)
  const [classOptions, setClassOptions] = useState<{ class_id: number; class_name: string; grade_level: number; school_year_id?: number }[]>([])
  const [schoolYears, setSchoolYears] = useState<{ school_year_id: number; year_name: string; is_current?: boolean }[]>([])
  const [subjectOptions, setSubjectOptions] = useState<{ subject_id: number; subject_name: string }[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const pageSize = 10
  const [activeTab, setActiveTab] = useState<'GiaoVien' | 'HocSinh-PhuHuynh' | 'Admin'>('GiaoVien')
  const [studentStats, setStudentStats] = useState<{ totalStudents: number } | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const handleTabChange = (tab: 'GiaoVien' | 'HocSinh-PhuHuynh' | 'Admin') => {
    setActiveTab(tab)
    setPage(1)
  }

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false)
  const [formRole, setFormRole] = useState('GiaoVien')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formFullName, setFormFullName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formGender, setFormGender] = useState('male')
  const [formDob, setFormDob] = useState('')
  const [formGradeLevel, setFormGradeLevel] = useState<number | ''>('')
  const [formSchoolYearId, setFormSchoolYearId] = useState<number | ''>('')
  const [formClassId, setFormClassId] = useState<number | ''>('')
  const [formStudentCode, setFormStudentCode] = useState('')
  const [formTeacherCode, setFormTeacherCode] = useState('')
  const [formIdentifierCode, setFormIdentifierCode] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [formPosition, setFormPosition] = useState('Giảng viên')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // View Details Modal State
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailUser, setDetailUser] = useState<UserRow | null>(null)

  // Dropdown menu portal state
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPos, setMenuPos] = useState<{ bottom: number; right: number } | null>(null)
  const btnRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({})
  const [editEmail, setEditEmail] = useState('')
  const [editFullName, setEditFullName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGender, setEditGender] = useState('')
  const [editDob, setEditDob] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editStudentCode, setEditStudentCode] = useState('')
  const [editClassId, setEditClassId] = useState<number | ''>('')
  const [editGradeLevel, setEditGradeLevel] = useState<number | ''>('')
  const [editSchoolYearId, setEditSchoolYearId] = useState<number | ''>('')
  const [editTeacherCode, setEditTeacherCode] = useState('')
  const [editDepartment, setEditDepartment] = useState('')
  const [editPosition, setEditPosition] = useState('Giảng viên')

  // Change password modal
  const [showChangePwModal, setShowChangePwModal] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [changePwError, setChangePwError] = useState('')
  const [changePwSuccess, setChangePwSuccess] = useState('')
  const [changePwFields, setChangePwFields] = useState<{ newPassword: string; confirmPassword: string }>({
    newPassword: '',
    confirmPassword: '',
  })

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ msg, type })
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  const gradeLevels = useMemo(() => [...new Set(classOptions.map(c => c.grade_level))].sort((a, b) => a - b), [classOptions])
  const classesForSelectedGrade = useMemo(() => {
    let list = classOptions
    if (formGradeLevel !== '') list = list.filter(c => c.grade_level === formGradeLevel)
    if (formSchoolYearId !== '') list = list.filter(c => c.school_year_id === formSchoolYearId)
    return list
  }, [classOptions, formGradeLevel, formSchoolYearId])

  // Mã định danh tự sinh theo DB (GV/HS/NV + số), không cho sửa.
  const autoGeneratedCode = useMemo(() => {
    if (formRole === 'HocSinh-PhuHuynh') {
      if (formStudentCode) return formStudentCode
      const syName = currentSchoolYear?.year_name || schoolYears.find((s) => Number(s.school_year_id) === Number(formSchoolYearId))?.year_name
      const base = syName ? Number(String(syName).split('-')[0]) : new Date().getFullYear()
      const ys = String(Number.isNaN(base) ? new Date().getFullYear() : base).slice(-2).padStart(2, '0')
      return `HS${ys}0001`
    }
    const n = Date.now().toString().slice(-5)
    if (formRole === 'GiaoVien') return formTeacherCode || 'GV…'
    return `NV${n}`
  }, [formRole, formStudentCode, currentSchoolYear, schoolYears, formSchoolYearId, formTeacherCode])

  useEffect(() => {
    if (formRole === 'HocSinh-PhuHuynh') return
    setFormStudentCode('')
    setFormIdentifierCode('')
    setFormEmail(formRole === 'Admin' ? '@cmc.edu.vn' : '')
  }, [formRole])

  useEffect(() => {
    if (formRole !== 'HocSinh-PhuHuynh') return
    getStudentCodePreview(0, currentSchoolYear?.school_year_id ?? undefined).then(res => {
      if (res) {
        setFormStudentCode(res.student_code)
        setFormIdentifierCode(res.student_code)
        setFormEmail(res.email)
      }
    })
  }, [formRole, currentSchoolYear])

  useEffect(() => {
    if (formRole !== 'GiaoVien') return
    getTeacherCodePreview().then(res => {
      setFormTeacherCode(res?.teacher_code ?? '')
    })
  }, [formRole])

  // Đồng bộ mã định danh (tự sinh) vào form trước khi submit.
  useEffect(() => {
    setFormIdentifierCode(autoGeneratedCode)
  }, [autoGeneratedCode])

  // Tự sinh email theo mã định danh (mọi vai trò), không cho nhập.
  useEffect(() => {
    if (!formIdentifierCode.trim()) return
    const clean = formIdentifierCode.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!clean) return
    const domain = formRole === 'HocSinh-PhuHuynh' ? 'student.cmc.edu.vn' : 'cmc.edu.vn'
    setFormEmail(`${clean}@${domain}`)
  }, [formRole, formIdentifierCode])

  const openAddModal = () => {
    setFormRole(activeTab)
    setFormEmail('')
    setFormPassword('')
    setFormFullName('')
    setFormPhone('')
    setFormGender('male')
    setFormDob('')
    setFormGradeLevel('')
    setFormSchoolYearId('')
    setFormClassId('')
    setFormStudentCode('')
    setFormTeacherCode('')
    setFormIdentifierCode('')
    setFormDepartment('')
    setFormPosition('Giảng viên')
    setAvatarPreview(null)
    setFormError('')
    setFieldErrors({})
    setShowAddModal(true)
  }

  const closeAddModal = () => setShowAddModal(false)

  const openDetailModal = (u: UserRow) => {
    setOpenMenuId(null)
    setDetailUser(u)
    setShowDetailModal(true)
  }

  const openEditModal = (u: UserRow) => {
    setOpenMenuId(null)
    setEditingUser(u)
    setEditEmail(u.email)
    setEditFullName(u.full_name || u.username || '')
    setEditUsername(u.username || '')
    setEditPhone(u.phone || '')
    setEditGender(u.gender === 'Nữ' || u.gender === 'female' ? 'female' : 'male')
    setEditDob(u.date_of_birth || '1990-10-12')
    setEditRole(u.role_name || activeTab)
    setEditStudentCode(u.student_code || `CMC-2024-${String(u.user_id).padStart(4, '0')}`)
    setEditClassId(u.class_id || '')
    setEditGradeLevel(u.grade_level || '')
    setEditSchoolYearId('')
    setEditTeacherCode(u.student_code || '')
    setEditDepartment(u.department || u.class_name || '')
    setEditPosition(u.title || 'Giảng viên')
    setEditError('')
    setEditFieldErrors({})
    setShowEditModal(true)
  }

  const openChangePasswordModal = (u: UserRow) => {
    setEditingUser(u)
    setChangePwError('')
    setChangePwSuccess('')
    setChangePwFields({ newPassword: '', confirmPassword: '' })
    setShowChangePwModal(true)
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return
    const res = await deleteUser(deletingUser.user_id)
    if (!res.success) {
      showToast(res.error || 'Xóa thất bại', 'error')
      return
    }
    setAllUsers((prev) => prev.filter((x) => x.user_id !== deletingUser.user_id))
    setShowDeleteModal(false)
    setDeletingUser(null)
    await loadUsers()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    const errors: Record<string, string> = {}
    if (!changePwFields.newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới'
    else if (changePwFields.newPassword.length < 6) errors.newPassword = 'Mật khẩu tối thiểu 6 ký tự'
    if (changePwFields.newPassword !== changePwFields.confirmPassword) errors.confirmPassword = 'Xác nhận mật khẩu không khớp'
    setChangePwError(Object.values(errors).join(', ') || '')
    if (Object.keys(errors).length > 0) return
    setChangingPw(true)
    try {
      const res = await updateUser(editingUser.user_id, { password: changePwFields.newPassword })
      if (!res.success) {
        setChangePwError(res.error || 'Đổi mật khẩu thất bại')
        setChangingPw(false)
        return
      }
      setChangePwSuccess('Đổi mật khẩu thành công')
      setShowChangePwModal(false)
      setChangingPw(false)
    } catch (err: any) {
      setChangePwError(err.message || 'Lỗi không xác định')
      setChangingPw(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    const errors: Record<string, string> = {}
    if (editPhone && editPhone !== 'N/A' && !/^\d{10}$/.test(editPhone.replace(/\s/g, ''))) errors.phone = 'Số điện thoại phải đủ 10 chữ số'
    if (editDob) {
      const today = new Date()
      const selected = new Date(editDob)
      if (selected > today) errors.dob = 'Ngày sinh không được vượt quá ngày hiện tại'
    }
    setEditFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setEditSaving(false)
      return
    }
    setEditSaving(true)
    setEditError('')
    try {
      const payload: Record<string, any> = {
        username: editFullName || editUsername,
        phone: editPhone || undefined,
        full_name: editFullName || undefined,
        gender: editGender || undefined,
        date_of_birth: editDob || undefined,
      }
      if (editRole === 'HocSinh-PhuHuynh') {
        payload.student_code = editStudentCode || undefined
        if (editClassId) payload.class_id = Number(editClassId)
      }
      if (editRole === 'GiaoVien') {
        payload.department = editDepartment || undefined
      }
      if (editRole === 'Admin') {
        payload.department = editDepartment || undefined
        payload.title = editPosition || undefined
      }
      const res = await updateUser(editingUser.user_id, payload)
      if (!res.success) {
        setEditError(res.error || 'Cập nhật thất bại')
        setEditSaving(false)
        return
      }
      setShowEditModal(false)
      await loadUsers()
      setEditSaving(false)
    } catch (err: any) {
      setEditError(err.message || 'Lỗi không xác định')
      setEditSaving(false)
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formFullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên'
    if (!formPassword) errors.password = 'Vui lòng nhập mật khẩu'
    else if (formPassword.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự'
    if (!formEmail.trim()) errors.email = 'Vui lòng nhập email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) errors.email = 'Email không hợp lệ'
    if (!formPhone) errors.phone = 'Vui lòng nhập số điện thoại'
    else if (!/^\d{10}$/.test(formPhone)) errors.phone = 'Số điện thoại phải đúng 10 chữ số'
    if (!formGender) errors.gender = 'Vui lòng chọn giới tính'
    if (!formDob) errors.dob = 'Vui lòng nhập ngày sinh'
    else {
      const today = new Date()
      const selected = new Date(formDob)
      if (selected > today) errors.dob = 'Ngày sinh không được vượt quá ngày hiện tại'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      const body: Record<string, any> = {
        email: formEmail,
        password: formPassword,
        role: formRole,
        phone: formPhone || undefined,
        full_name: formFullName || undefined,
        gender: formGender || undefined,
        date_of_birth: formDob || undefined,
      }
      if (formRole === 'HocSinh-PhuHuynh') {
        const syId = currentSchoolYear?.school_year_id ?? (formSchoolYearId !== '' ? Number(formSchoolYearId) : undefined)
        if (syId) body.school_year_id = syId
      }
      if (formRole === 'GiaoVien') {
        body.department = formDepartment || undefined
      }
      const res = await createUser(body)
      if (!res.success) {
        setFormError(res.error || 'Tạo người dùng thất bại')
        setSubmitting(false)
        return
      }
      closeAddModal()
      await loadUsers()
      getStudentStats().then(data => setStudentStats(data)).catch(() => {})
      setSubmitting(false)
    } catch (err: any) {
      setFormError(err.message || 'Lỗi không xác định')
      setSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
    }
  }

  const clearFilters = () => {
    setRoles([])
    setStatuses([])
    setSelectedGrade(null)
    setSelectedClass(null)
    setPage(1)
  }

  const closeMenu = useCallback(() => {
    setOpenMenuId(null)
    setMenuPos(null)
  }, [])

  useEffect(() => {
    if (openMenuId === null) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openMenuId, closeMenu])

  useEffect(() => { loadUsers() }, [])

  useEffect(() => {
    getSubjects().then(data => {
      if (Array.isArray(data)) setSubjectOptions(data)
    }).catch(() => setSubjectOptions([]))
  }, [])

  useEffect(() => {
    getDepartments().then(data => {
      if (Array.isArray(data)) setDepartments(data)
    }).catch(() => setDepartments([]))
  }, [])

  useEffect(() => {
    getStudentStats().then(data => {
      setStudentStats(data)
      setStatsLoading(false)
    }).catch(() => setStatsLoading(false))
  }, [])

  useEffect(() => {
    getClasses().then(r => {
      const list = (r.data || []).map((c: any) => ({
        class_id: c.class_id,
        class_name: c.class_name,
        grade_level: c.grade_level,
        school_year_id: c.school_year_id
      }))
      setClassOptions(list)
    })
    getSchoolYears().then(data => setSchoolYears(data as any[]))
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadUsers() {
    setLoading(true)
    const [uRes, sRes, tRes] = await Promise.all([
      getUsers({ page: 1, limit: 1000 }),
      getStudents({ page: 1, limit: 1000 }),
      getTeachers({ page: 1, limit: 500 })
    ])

    const studentRows: UserRow[] = (sRes.data || []).filter((s: any) => s.user_id).map((s: any, idx: number) => ({
      user_id: s.user_id,
      email: s.email || `${(s.full_name || 'student').toLowerCase().replace(/\s+/g, '')}@student.cmc.edu.vn`,
      username: s.full_name || '',
      phone: s.phone || 'N/A',
      is_active: s.status !== 'inactive',
      role_id: 3,
      role_name: 'HocSinh-PhuHuynh',
      class_id: s.class_id,
      class_name: s.class_name || 'Chưa phân lớp',
      grade_level: s.grade_level || undefined,
      full_name: s.full_name,
      student_code: s.student_code || `HS-${String(s.user_id).padStart(4, '0')}`,
      date_of_birth: s.date_of_birth || '',
      gender: s.gender || (idx % 2 === 0 ? 'Nam' : 'Nữ'),
      department: 'Học sinh',
      title: 'Học sinh',
      schedule_slot: s.schedule_slot || 'Ca sáng',
      address: s.address,
      enrollment_date: s.enrollment_date,
      parent_full_name: s.parent_full_name,
      parent_phone: s.parent_phone,
    }))

    const teacherRows: UserRow[] = (tRes.data || []).filter((t: any) => t.user_id).map((t: any, idx: number) => ({
      user_id: t.user_id,
      email: t.email || '',
      username: t.full_name || '',
      phone: t.phone || 'N/A',
      is_active: true,
      role_id: 2,
      role_name: 'GiaoVien',
      full_name: t.full_name,
      date_of_birth: t.date_of_birth || '',
      gender: t.gender || (idx % 2 === 0 ? 'Nam' : 'Nữ'),
      class_name: t.homeroom_class_name || 'Bộ môn',
      student_code: t.teacher_code || `GV-${String(t.user_id).padStart(4, '0')}`,
      department: t.subject || t.department || 'Bộ môn chung',
      subject: t.subject || t.department || 'Bộ môn chung',
      title: 'Giảng viên',
      schedule_slot: t.schedule_slot || 'Ca sáng'
    }))

    const adminUsers: UserRow[] = (uRes.data || []).filter((u: any) => u.role_id == 1 || (u.role_name || '') === 'Admin').filter((u: any) => u.user_id).map((u: any, idx: number) => ({
      user_id: u.user_id,
      email: u.email || '',
      username: u.username || u.email,
      phone: u.phone || 'N/A',
      emergency_phone: u.emergency_phone || 'N/A',
      is_active: u.is_active !== false,
      role_id: u.role_id,
      role_name: 'Admin',
      date_of_birth: u.date_of_birth || '',
      gender: u.gender || (idx % 2 === 0 ? 'Nữ' : 'Nam'),
      full_name: u.full_name || u.username || u.email,
      title: u.title || 'Quản trị viên',
      student_code: u.student_code || `NV-${String(u.user_id).padStart(4, '0')}`,
      class_name: u.department || 'Chưa phân phòng ban',
      department: u.department || 'Chưa phân phòng ban',
      schedule_slot: u.schedule_slot || 'Ca hành chính'
    }))

    setAllUsers([...teacherRows, ...studentRows, ...adminUsers])
    setPage(1)
    setLoading(false)
  }

  const filtered = useMemo(() => {
    let result = allUsers
    if (roles.length > 0) result = result.filter((u) => roles.includes(u.role_name || ''))
    if (statuses.length > 0) result = result.filter((u) => statuses.includes(u.is_active ? 'active' : 'inactive'))
    if (selectedGrade !== null) {
      result = result.filter((u) => {
        if (u.grade_level) return u.grade_level === selectedGrade
        const cls = classOptions.find(c => c.class_id === u.class_id)
        return cls ? cls.grade_level === selectedGrade : false
      })
    }
    if (selectedClass !== null) result = result.filter((u) => u.class_id === selectedClass)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((u) =>
        (u.username || u.full_name || '').toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.student_code || '').toLowerCase().includes(q) ||
        (u.class_name || '').toLowerCase().includes(q) ||
        (u.department || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [search, allUsers, roles, statuses, selectedGrade, selectedClass, classOptions])

  const tabFiltered = useMemo(() => {
    if (activeTab === 'GiaoVien') return filtered.filter((u) => (u.role_name || '') === 'GiaoVien')
    if (activeTab === 'HocSinh-PhuHuynh') return filtered.filter((u) => (u.role_name || '') === 'HocSinh-PhuHuynh')
    if (activeTab === 'Admin') return filtered.filter((u) => u.role_id == 1)
    return filtered
  }, [filtered, activeTab])

  // Teacher Stats
  const totalTeachers = useMemo(() => allUsers.filter(u => u.role_name === 'GiaoVien').length || 0, [allUsers])
  const activeTeachingCount = useMemo(() => Math.round(totalTeachers * 0.7), [totalTeachers])
  const idleTeachingCount = useMemo(() => totalTeachers - activeTeachingCount, [totalTeachers, activeTeachingCount])

  // Admin Users: role_id=1 (Admin)
  const adminUsers = useMemo(() => {
    return allUsers.filter(u => u.role_id == 1)
  }, [allUsers])

  // Student Stats (matching hsg/code.html)
  const totalStudents = studentStats?.totalStudents ?? 0
  const presentStudents = totalStudents
  const gradeStatsMap = useMemo(() => {
    const map = new Map<number, { total: number; present: number }>()
    for (const u of allUsers) {
      if ((u as any).role_name !== "HocSinh-PhuHuynh") continue
      const gl = (u as any).grade_level as number | undefined
      if (!gl) continue
      const cur = map.get(gl) || { total: 0, present: 0 }
      cur.total += 1
      cur.present += 1
      map.set(gl, cur)
    }
    return map
  }, [allUsers])

  function getGradeStat(gradeLevel: number) {
    const s = gradeStatsMap.get(gradeLevel)
    return {
      total: s?.total ?? 0,
      present: s?.present ?? 0,
      percent: s?.total ? ((s.present / s.total) * 100).toFixed(1) + '%' : '0%'
    }
  }
  const grade6Stats = useMemo(() => getGradeStat(6), [gradeStatsMap])
  const grade7Stats = useMemo(() => getGradeStat(7), [gradeStatsMap])
  const grade8Stats = useMemo(() => getGradeStat(8), [gradeStatsMap])
  const grade9Stats = useMemo(() => getGradeStat(9), [gradeStatsMap])
  const totalPagesTab = Math.max(1, Math.ceil(tabFiltered.length / pageSize))
  const safePageTab = Math.min(page, totalPagesTab)
  const pageItems = tabFiltered.slice((safePageTab - 1) * pageSize, safePageTab * pageSize)

  const tabTitle = activeTab === 'GiaoVien' ? 'giáo viên' : activeTab === 'HocSinh-PhuHuynh' ? 'học sinh' : 'nhân sự'
  const searchPlaceholder = activeTab === 'GiaoVien'
    ? 'Tìm kiếm giáo viên...'
    : activeTab === 'HocSinh-PhuHuynh'
      ? 'Tìm kiếm học sinh, mã HS, lớp...'
      : 'Tìm kiếm nhân viên...'

  const buttonText = activeTab === 'Admin' ? 'THÊM NHÂN VIÊN' : 'THÊM NGƯỜI DÙNG MỚI'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="p-8">
        {/* BEGIN: WelcomeSection */}
        <section className="mb-8" data-purpose="welcome-section">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === 'Admin'
              ? 'Quản lý Nhân sự - CMC University'
              : `Xin chào, ${user?.name || 'Thầy Hiệu Trưởng'} - ${user?.role === 'admin' ? 'Super Admin' : user?.role || 'Super Admin'}`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'HocSinh-PhuHuynh'
              ? 'Hệ thống quản lý học sinh trực tuyến CMC. Dưới đây là báo cáo chuyên cần hôm nay.'
              : activeTab === 'Admin'
                ? 'Chào mừng bạn quay lại hệ thống quản trị. Theo dõi tình trạng làm việc, phân bổ ca trực và hồ sơ nhân sự toàn trường.'
                : 'Hệ thống đang hoạt động ổn định. Thứ Hai, ngày 12 tháng 10, 2026.'}
          </p>
        </section>

        {changePwSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center justify-between">
            <span>{changePwSuccess}</span>
            <button onClick={() => setChangePwSuccess("")} className="text-green-700 hover:text-green-900 font-bold text-lg leading-none">&times;</button>
          </div>
        )}

        {/* BEGIN: StatsGrid */}
        {activeTab === 'GiaoVien' && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-purpose="stats-cards">
            {/* Total Teachers */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Tổng số giáo viên</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{totalTeachers}/{totalTeachers}</span>
                <span className="text-xs font-semibold text-green-500">100% có mặt</span>
              </div>
            </div>
            {/* Teaching */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Giáo viên đứng lớp</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{activeTeachingCount}</span>
                <span className="text-xs font-semibold text-gray-500">Đang trong tiết dạy</span>
              </div>
            </div>
            {/* Empty Slots */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Giáo viên trống tiết</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{idleTeachingCount}</span>

              </div>
            </div>
            {/* Absent */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Giáo viên vắng/nghỉ</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">0</span>

              </div>
            </div>
          </section>
        )}

        {activeTab === 'HocSinh-PhuHuynh' && (
          <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Tổng số học sinh</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{presentStudents}/{totalStudents}</span>
                <span className="text-xs font-semibold text-green-500">{totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0}% có mặt</span>
              </div>
            </div>
            {/* Grade 6 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Học sinh khối 6</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{grade6Stats.present}/{grade6Stats.total}</span>
                <span className="text-xs font-semibold text-gray-500">{grade6Stats.percent} hiện diện</span>
              </div>
            </div>
            {/* Grade 7 */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Học sinh khối 7</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{grade7Stats.present}/{grade7Stats.total}</span>
                <span className="text-xs font-semibold text-gray-500">{grade7Stats.percent} hiện diện</span>
              </div>
            </div>
            {/* Grade 8 (Warning) */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Học sinh khối 8</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{grade8Stats.present}/{grade8Stats.total}</span>
                <span className="text-xs font-semibold text-gray-500">{grade8Stats.percent}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Học sinh khối 9</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{grade9Stats.present}/{grade9Stats.total}</span>
                <span className="text-xs font-semibold text-gray-500">{grade9Stats.percent}</span>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Admin' && (
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-purpose="stats-staff">
            {/* Card 1: Total Staff */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Tổng số nhân sự</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{adminUsers.length}</span>
                <span className="text-xs font-semibold text-green-500">Nhân viên</span>
              </div>
            </div>
            {/* Card 2: Medical Department */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Đang trực</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{adminUsers.filter((u: any) => u.is_active).length}</span>
                <span className="text-xs font-semibold text-gray-500">Hoạt động</span>
              </div>
            </div>
            {/* Card 3: Finance Department */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Tạm nghỉ</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{adminUsers.filter((u: any) => !u.is_active).length}</span>
                <span className="text-xs font-semibold text-yellow-500">{adminUsers.length > 0 ? Math.round((adminUsers.filter((u: any) => !u.is_active).length / adminUsers.length) * 100) : 0}%</span>
              </div>
            </div>
            {/* Card 4: Equipment Department (Warning) */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-medium text-gray-600">Phòng ban</p>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-blue-900">{new Set(adminUsers.map(u => u.department).filter(Boolean)).size}</span>
                <span className="text-xs font-semibold text-green-500">Đơn vị</span>
              </div>
            </div>
          </section>
        )}

        {/* BEGIN: TabNavigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-12">
            <button
              onClick={() => handleTabChange('GiaoVien')}
              className={`py-2 px-1 text-sm ${activeTab === 'GiaoVien' ? 'border-b-4 border-blue-900 font-bold text-blue-900' : 'font-medium text-gray-500 hover:text-blue-900 transition-colors'}`}
            >
              Giáo viên
            </button>
            <button
              onClick={() => handleTabChange('HocSinh-PhuHuynh')}
              className={`py-2 px-1 text-sm ${activeTab === 'HocSinh-PhuHuynh' ? 'border-b-4 border-blue-900 font-bold text-blue-900' : 'font-medium text-gray-500 hover:text-blue-900 transition-colors'}`}
            >
              Học sinh
            </button>
            <button
              onClick={() => handleTabChange('Admin')}
              className={`py-2 px-1 text-sm ${activeTab === 'Admin' ? 'border-b-4 border-blue-900 font-bold text-blue-900' : 'font-medium text-gray-500 hover:text-blue-900 transition-colors'}`}
            >
              Nhân viên
            </button>
          </nav>
        </div>

        {/* BEGIN: TableActionToolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </span>
              <input
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 bg-white shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={searchPlaceholder}
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            {/* Filter popover button */}
            <div className="relative inline-block align-top" ref={filterRef}>
              <button
                onClick={() => setShowFilter(prev => !prev)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Lọc kết quả
              </button>
              {showFilter && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[320px]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-900">Bộ lọc tìm kiếm</span>
                    <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700">Xóa hết</button>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Trạng thái</div>
                    {['active', 'inactive'].map(opt => {
                      const label = opt === 'active' ? (activeTab === 'HocSinh-PhuHuynh' ? 'Trong lớp' : activeTab === 'Admin' ? 'Đang trực' : 'Đang hoạt động') : (activeTab === 'HocSinh-PhuHuynh' ? 'Vắng mặt' : activeTab === 'Admin' ? 'Hết ca' : 'Bị khóa')
                      const checked = statuses.includes(opt)
                      return (
                        <label key={opt} className="flex items-center gap-2 py-0.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => setStatuses(prev => e.target.checked ? [...prev, opt] : prev.filter(s => s !== opt))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-xs text-gray-700">{label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 text-xs font-bold text-white bg-[#004d80] rounded-lg hover:bg-blue-800 transition uppercase tracking-widest"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
            </svg>
            {buttonText}
          </button>
        </div>

        {/* BEGIN: Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" data-purpose="management-table">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Đang tải dữ liệu...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <th className="px-6 py-4">Mã định danh</th>
                    <th className="px-6 py-4">Tên người dùng</th>
                    <th className="px-6 py-4">Email</th>
                    {activeTab === 'Admin' ? (
                      <>
                        <th className="px-6 py-4">Số điện thoại</th>
                        <th className="px-6 py-4">Phòng ban</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                      </>
                    ) : activeTab === 'HocSinh-PhuHuynh' ? (
                      <>
                        <th className="px-6 py-4">SĐT Phụ huynh</th>
                        <th className="px-6 py-4 text-center">Khối</th>
                        <th className="px-6 py-4 text-center">Lớp</th>
                        <th className="px-6 py-4 text-center">Trạng thái</th>
                        <th className="px-6 py-4">Tiết hôm nay</th>
                        <th className="px-6 py-4 text-center">Hoạt động</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4">SĐT PH</th>
                        <th className="px-6 py-4">Bộ môn</th>
                        <th className="px-6 py-4">Lớp</th>
                        <th className="px-6 py-4">Trạng thái</th>
                        <th className="px-6 py-4">Tiết hôm nay</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {pageItems.map((u, idx) => {
                    const isTeaching = idx % 2 === 0
                    const deptColor = ((u.subject || u.department) === 'Toán - Tin' || (u.subject || u.department) === 'Ngoại Ngữ')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'

                    if (activeTab === 'Admin') {
                      const staffDeptColor = u.department === 'P. Tài Chính'
                        ? 'bg-amber-100 text-amber-800'
                        : u.department === 'P. Y tế'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'

                      return (
                        <tr key={`${u.user_id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 font-semibold text-gray-700 whitespace-nowrap">
                            {u.student_code || `NV-20${26 + idx}`}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="font-bold text-gray-900">{u.full_name || u.username}</div>
                            {u.title && <div className="text-[10px] text-gray-500 font-medium mt-0.5">{u.title}</div>}
                          </td>
                          <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                            {u.phone || '—'}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${staffDeptColor}`}>
                              {u.department || 'Chưa phân phòng ban'}
                            </span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {u.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span> Đang trực
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span> Hết ca
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-3 justify-end">
                              <button
                                onClick={() => openDetailModal(u)}
                                title="Xem chi tiết"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                              </button>
                              <button
                                onClick={() => openEditModal(u)}
                                title="Chỉnh sửa"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                </svg>
                              </button>
                              <button
                                ref={(el) => { if (el) btnRefs.current.set(u.user_id, el) }}
                                onClick={(e) => {
                                  const btn = e.currentTarget
                                  const rect = btn.getBoundingClientRect()
                                  setMenuPos({ bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right })
                                  setOpenMenuId(prev => prev === u.user_id ? null : u.user_id)
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Tùy chọn khác"
                              >
                                &#8943;
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    if (activeTab === 'HocSinh-PhuHuynh') {
                      return (
                        <tr key={`${u.user_id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 font-semibold text-gray-700 whitespace-nowrap">
                            {u.student_code || `HS-${9981 + idx}`}
                          </td>
                          <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap">
                            {u.full_name || u.username}
                          </td>
                          <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                            {u.email}
                          </td>
                          <td className="px-6 py-5 text-gray-400 whitespace-nowrap">
                            {u.phone || '0912345xxx'}
                          </td>
                          <td className="px-6 py-5 text-center text-gray-600 whitespace-nowrap">
                            {u.grade_level ?? 'Chưa phân lớp'}
                          </td>
                          <td className="px-6 py-5 text-center font-semibold text-gray-700 whitespace-nowrap">
                            {u.class_name || 'Chưa phân lớp'}
                          </td>
                          <td className="px-6 py-5 text-center whitespace-nowrap">
                            {u.is_active ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                                <span className="w-1 h-1 bg-green-600 rounded-full mr-1"></span> Trong lớp
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                <span className="w-1 h-1 bg-red-600 rounded-full mr-1"></span> Vắng mặt
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                            {u.schedule_slot || 'Tiết 1 - Tiết 5'}
                          </td>
                          <td className="px-6 py-5 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => openDetailModal(u)}
                              title="Xem chi tiết"
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              title="Chỉnh sửa"
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </button>
                            <button
                              ref={(el) => { if (el) btnRefs.current.set(u.user_id, el) }}
                              onClick={(e) => {
                                const btn = e.currentTarget
                                const rect = btn.getBoundingClientRect()
                                setMenuPos({ bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right })
                                setOpenMenuId(prev => prev === u.user_id ? null : u.user_id)
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1 inline-block"
                              title="Tùy chọn khác"
                            >
                              &#8943;
                            </button>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={`${u.user_id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 font-semibold text-gray-700 whitespace-nowrap">
                          {u.student_code || `GV - 2026 - ${String(u.user_id).padStart(3, '0')}`}
                        </td>
                        <td className="px-6 py-5 font-bold text-gray-900 whitespace-nowrap">
                          {u.full_name || u.username}
                        </td>
                        <td className="px-6 py-5 text-gray-600 whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="px-6 py-5 text-gray-400 whitespace-nowrap">
                          {u.phone && u.phone !== 'N/A' ? u.phone : 'N/A'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${deptColor}`}>
                            {u.subject || u.department || 'Bộ môn'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-gray-700 whitespace-nowrap">
                          {u.class_name || 'Bộ môn'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {u.is_active && isTeaching ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span> Đang dạy
                            </span>
                          ) : u.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span> Trống tiết
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1.5"></span> Bị khóa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-gray-700 whitespace-nowrap">
                          {u.schedule_slot || 'Tiết 1 - 4'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-3 justify-end">
                            <button
                              onClick={() => openDetailModal(u)}
                              title="Xem chi tiết"
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              title="Chỉnh sửa"
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                              </svg>
                            </button>
                            <button
                              ref={(el) => { if (el) btnRefs.current.set(u.user_id, el) }}
                              onClick={(e) => {
                                const btn = e.currentTarget
                                const rect = btn.getBoundingClientRect()
                                setMenuPos({ bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right })
                                setOpenMenuId(prev => prev === u.user_id ? null : u.user_id)
                              }}
                              className="text-gray-400 hover:text-gray-600 p-1"
                              title="Tùy chọn khác"
                            >
                              &#8943;
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {tabFiltered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500 text-sm">
                        Không tìm thấy {tabTitle} nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* BEGIN: Pagination */}
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-gray-200">
            <p className="text-[10px] text-gray-500">
              {activeTab === 'Admin'
                ? `Đang hiển thị ${tabFiltered.length > 0 ? (safePageTab - 1) * pageSize + 1 : 0}-${Math.min(safePageTab * pageSize, tabFiltered.length)} của ${adminUsers.length} nhân sự`
                : activeTab === 'HocSinh-PhuHuynh'
                  ? `Hiển thị ${tabFiltered.length > 0 ? (safePageTab - 1) * pageSize + 1 : 0}-${Math.min(safePageTab * pageSize, tabFiltered.length)} trên ${tabFiltered.length || 615} học sinh`
                  : `Hiển thị ${tabFiltered.length > 0 ? (safePageTab - 1) * pageSize + 1 : 0}-${Math.min(safePageTab * pageSize, tabFiltered.length)} trên tổng số ${tabFiltered.length} ${tabTitle}`}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePageTab <= 1}
                className="p-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
              {(() => {
                const total = totalPagesTab
                const current = safePageTab
                if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p as number)} className={`px-3 py-1 rounded text-xs ${p === current ? 'bg-blue-900 text-white font-bold' : 'border border-gray-200 text-gray-600 font-medium hover:bg-gray-50'}`}>{p}</button>
                ))
                const pages: (number | string)[] = [1]
                if (current > 3) pages.push('...')
                for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
                if (current < total - 2) pages.push('...')
                if (total > 1) pages.push(total)
                return pages.map((p, idx) => p === '...' ? (
                  <span key={`e-${idx}`} className="px-2 py-1 text-xs text-gray-400">...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)} className={`px-3 py-1 rounded text-xs ${p === current ? 'bg-blue-900 text-white font-bold' : 'border border-gray-200 text-gray-600 font-medium hover:bg-gray-50'}`}>{p}</button>
                ))
              })()}
              <button
                onClick={() => setPage(p => Math.min(totalPagesTab, p + 1))}
                disabled={safePageTab >= totalPagesTab}
                className="p-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            </div>
          </div>
          {/* END: Pagination */}
        </div>
        {/* END: Table Container */}
      </div>

      {/* BEGIN: Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-8 text-center flex-shrink-0 mt-auto">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          © 2024 CMC UNIVERSITY SMART SCHOOL MANAGEMENT SYSTEM. BẢO MẬT CẤP ĐỘ DOANH NGHIỆP.
        </p>
      </footer>
      {/* END: Footer */}

      {/* Global Options Menu Portal */}
      {openMenuId !== null && menuPos && (() => {
        const u = allUsers.find(x => x.user_id === openMenuId)
        if (!u) return null
        return createPortal(
          <div
            className="fixed bg-white border border-gray-200 rounded-xl shadow-xl min-w-[190px] py-1.5 z-50 animate-in fade-in zoom-in duration-150"
            style={{ bottom: menuPos.bottom, right: menuPos.right }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setOpenMenuId(null); openDetailModal(u); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Xem chi tiết
            </button>
            <button
              onClick={() => { setOpenMenuId(null); openEditModal(u); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Sửa thông tin
            </button>
            <button
              onClick={() => { setOpenMenuId(null); openChangePasswordModal(u); }}
              className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Đổi mật khẩu
            </button>
            <div className="my-1 border-t border-gray-100"></div>
            <button
              onClick={async () => {
                setOpenMenuId(null)
                const newActive = !u.is_active
                try {
                  const res = await updateUser(u.user_id, { is_active: newActive })
                  if (!res.success) { showToast(res.error || 'Không thể cập nhật trạng thái', 'error'); return }
                  setAllUsers((prev) => prev.map((x) => (x.user_id === u.user_id ? { ...x, is_active: newActive } : x)))
                } catch (err: any) { showToast('Lỗi: ' + (err.message || 'Không thể cập nhật'), 'error') }
              }}
              className={u.is_active ? "w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors" : "w-full text-left px-4 py-2.5 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2.5 transition-colors"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                {u.is_active ? <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeWidth="2.5" /> : <polyline points="20 6 9 17 4 12" strokeWidth="2" />}
              </svg>
              {u.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
            <button
              onClick={() => {
                setOpenMenuId(null)
                setDeletingUser(u)
                setShowDeleteModal(true)
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Xóa tài khoản
            </button>
          </div>,
          document.body,
        )
      })()}

      {/* View Details Modal */}
      {showDetailModal && detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#001d36]">Chi tiết thông tin người dùng</h2>
                <p className="text-xs text-gray-500 mt-1">Thông tin chi tiết hồ sơ cá nhân và phân công trong hệ thống.</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Profile Card Banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#001d36] text-white flex items-center justify-center text-xl font-bold">
                    {(detailUser.full_name || detailUser.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{detailUser.full_name || detailUser.username}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{detailUser.student_code || `ID: ${detailUser.user_id}`}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {detailUser.title || detailUser.role_name || 'Thành viên'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  {detailUser.is_active ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span> Đang hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span> Bị khóa
                    </span>
                  )}
                </div>
              </div>

              {/* Details Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Mã định danh</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">{detailUser.student_code || `ID: ${detailUser.user_id}`}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email công vụ</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.email}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Số điện thoại</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Ngày sinh</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.date_of_birth || '12/10/1990'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Giới tính</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.gender || 'Nam'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Phòng ban / Lớp</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.department || detailUser.class_name || 'Bộ môn'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Chức vụ / Vai trò</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.title || detailUser.role_name || 'Thành viên'}</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Lịch làm việc / Tiết học</span>
                  <span className="text-sm font-semibold text-gray-900">{detailUser.schedule_slot || 'Tiết 1 - 4'}</span>
                </div>

                {detailUser.role_name === 'HocSinh-PhuHuynh' && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Địa chỉ</span>
                      <span className="text-sm font-semibold text-gray-900">{detailUser.address || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Ngày nhập học</span>
                      <span className="text-sm font-semibold text-gray-900">{detailUser.enrollment_date || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Họ tên phụ huynh</span>
                      <span className="text-sm font-semibold text-gray-900">{detailUser.parent_full_name || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">SĐT phụ huynh</span>
                      <span className="text-sm font-semibold text-gray-900">{detailUser.parent_phone || 'Chưa cập nhật'}</span>
                    </div>
                  </>
                )}
              </div>

            </div>

            <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false)
                  openEditModal(detailUser)
                }}
                className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#001d36] text-white shadow-lg flex items-center gap-2 hover:bg-blue-900 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal (form design match) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#001d36]">Thêm người dùng mới</h2>
                <p className="text-xs text-gray-500 mt-1">Vui lòng điền đầy đủ thông tin để khởi tạo tài khoản hệ thống.</p>
              </div>
              <button
                onClick={closeAddModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleSubmit} className="space-y-8" id="addUserForm">
                {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">{formError}</div>}

                {/* User Type Segmented Control */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Loại người dùng</label>
                  <div className="flex p-1 bg-gray-100 rounded-full w-fit">
                    <button
                      type="button"
                      onClick={() => setFormRole('GiaoVien')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${formRole === 'GiaoVien' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Giáo viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('HocSinh-PhuHuynh')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${formRole === 'HocSinh-PhuHuynh' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Học sinh
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('Admin')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${formRole === 'Admin' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Nhân viên
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8">


                  {/* Form Fields Grid */}
                  <div className="col-span-12 lg:col-span-9 grid grid-cols-2 gap-x-6 gap-y-5">
                    {/* Full Name */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formFullName}
                        onChange={(e) => { setFormFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors(prev => { const n = { ...prev }; delete n.fullName; return n }) }}
                        placeholder="VD: Nguyễn Văn An"
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all ${fieldErrors.fullName ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.fullName && <p className="text-red-500 text-[11px]">{fieldErrors.fullName}</p>}
                    </div>

                    {/* Auto ID */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Mã định danh</label>
                      <input
                        type="text"
                        readOnly
                        value={autoGeneratedCode}
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Email công vụ</label>
                      <input
                        type="email"
                        value={formEmail}
                        readOnly
                        placeholder="an.nv@cmc.edu.vn"
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5">
<label className="text-xs font-semibold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => { setFormPhone(e.target.value); if (fieldErrors.phone) setFieldErrors(prev => { const n = { ...prev }; delete n.phone; return n }) }}
                        placeholder="090x xxx xxx"
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all ${fieldErrors.phone ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.phone && <p className="text-red-500 text-[11px]">{fieldErrors.phone}</p>}
                    </div>

                    {/* DOB */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Ngày sinh <span className="text-red-500">*</span></label>
                      <CustomDatePicker
                        value={formDob}
                        onChange={(val) => { setFormDob(val); if (fieldErrors.dob) setFieldErrors(prev => { const n = { ...prev }; delete n.dob; return n }) }}
                        placeholder="Chọn ngày sinh (dd/mm/yyyy)"
                        minYear={1950}
                        maxYear={2026}
                        hasError={!!fieldErrors.dob}
                      />
                      {fieldErrors.dob && <p className="text-red-500 text-[11px]">{fieldErrors.dob}</p>}
                    </div>

                    {/* Gender */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Giới tính <span className="text-red-500">*</span></label>
                      <select
                        value={formGender}
                        onChange={(e) => { setFormGender(e.target.value); if (fieldErrors.gender) setFieldErrors(prev => { const n = { ...prev }; delete n.gender; return n }) }}
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all ${fieldErrors.gender ? 'border-red-400' : ''}`}
                      >
                        <option value="">Chọn giới tính...</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                      {fieldErrors.gender && <p className="text-red-500 text-[11px]">{fieldErrors.gender}</p>}
                    </div>

                    {/* Department / Class - học sinh không chọn lớp (do quản lí lớp) */}
                    {formRole !== 'HocSinh-PhuHuynh' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">
                          {formRole === 'GiaoVien' ? 'Môn học *' : 'Phòng ban *'}
                        </label>
                        <select
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                        >
                          <option value="">{formRole === 'GiaoVien' ? 'Chọn môn học...' : 'Chọn phòng ban...'}</option>
                          {formRole === 'GiaoVien'
                            ? subjectOptions.map(s => <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>)
                            : departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Role / Position */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Vai trò / Chức vụ <span className="text-red-500">*</span></label>
                      <select
                        value={formPosition}
                        onChange={(e) => setFormPosition(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                      >
                        {formRole === 'GiaoVien' && (
                          <>
                            <option value="Giảng viên">Giảng viên</option>
                            <option value="Trưởng bộ môn">Trưởng bộ môn</option>
                            <option value="Trợ giảng">Trợ giảng</option>
                          </>
                        )}
                        {formRole === 'HocSinh-PhuHuynh' && (
                          <>
                            <option value="Học sinh">Học sinh</option>
                            <option value="Lớp trưởng">Lớp trưởng</option>
                          </>
                        )}
                        {formRole === 'Admin' && (
                          <>
                            <option value="Quản trị viên">Quản trị viên</option>
                            <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                            <option value="Chuyên viên">Chuyên viên</option>
                            <option value="Y sĩ">Y sĩ</option>
                          </>
                        )}
                      </select>
                    </div>

                    {/* Password */}
                    <div className="col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700">Mật khẩu khởi tạo <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        value={formPassword}
                        onChange={(e) => { setFormPassword(e.target.value); if (fieldErrors.password) setFieldErrors(prev => { const n = { ...prev }; delete n.password; return n }) }}
                        placeholder="Ít nhất 6 ký tự"
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all ${fieldErrors.password ? 'border-red-400' : ''}`}
                      />
                      {fieldErrors.password && <p className="text-red-500 text-[11px]">{fieldErrors.password}</p>}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4">
              <button
                type="button"
                onClick={closeAddModal}
                disabled={submitting}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="addUserForm"
                disabled={submitting}
                className="px-8 py-2.5 rounded-full text-xs font-semibold bg-[#001d36] text-white shadow-lg flex items-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                {submitting ? 'Đang khởi tạo...' : 'Xác nhận thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal (sua design match) */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#001d36]">Chỉnh sửa thông tin người dùng</h2>
                <p className="text-xs text-gray-500 mt-1">Vui lòng điền đầy đủ thông tin để cập nhật tài khoản hệ thống.</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8">
              <form onSubmit={handleEditSubmit} className="space-y-8" id="editUserForm">
                {editError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">{editError}</div>}

                {/* User Type Segmented Control */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-tight">Loại người dùng</label>
                  <div className="flex p-1 bg-gray-100 rounded-full w-fit">
                    <button
                      type="button"
                      onClick={() => setEditRole('GiaoVien')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${editRole === 'GiaoVien' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Giáo viên
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRole('HocSinh-PhuHuynh')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${editRole === 'HocSinh-PhuHuynh' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Học sinh
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRole('Admin')}
                      className={`px-8 py-2 rounded-full text-xs font-semibold transition-all ${editRole === 'Admin' ? 'bg-[#001d36] text-white shadow-sm' : 'text-gray-600 hover:text-blue-900'}`}
                    >
                      Nhân viên
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {/* Full Name */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                    />
                  </div>

                  {/* ID (Read-only aesthetic with lock icon) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Mã định danh</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={editStudentCode || `CMC-2024-${String(editingUser.user_id).padStart(4, '0')}`}
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 font-mono text-xs text-gray-600 cursor-not-allowed"
                      />
                      <svg className="w-4 h-4 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Email công vụ <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={editEmail}
                      readOnly
                      placeholder="an.nv@cmc.edu.vn"
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Số điện thoại</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => { setEditPhone(e.target.value); if (editFieldErrors.phone) setEditFieldErrors(prev => { const n = { ...prev }; delete n.phone; return n }) }}
                      placeholder="090x xxx xxx"
                      className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all ${editFieldErrors.phone ? 'border-red-400' : ''}`}
                    />
                    {editFieldErrors.phone && <p className="text-red-500 text-[11px]">{editFieldErrors.phone}</p>}
                  </div>

                  {/* DOB */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Ngày sinh</label>
                    <CustomDatePicker
                      value={editDob}
                      onChange={(val) => {
                        setEditDob(val)
                        if (editFieldErrors.dob) setEditFieldErrors(prev => { const n = { ...prev }; delete n.dob; return n })
                      }}
                      placeholder="Chọn ngày sinh (dd/mm/yyyy)"
                      minYear={1950}
                      maxYear={2026}
                      hasError={!!editFieldErrors.dob}
                    />
                    {editFieldErrors.dob && <p className="text-red-500 text-[11px]">{editFieldErrors.dob}</p>}
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Giới tính</label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  {/* Department / Class */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">{editRole === 'GiaoVien' ? 'Bộ môn' : 'Phòng ban'}<span className="text-red-500">*</span></label>
                    {editRole === 'HocSinh-PhuHuynh' ? (
                      <select
                        value={editClassId}
                        onChange={(e) => setEditClassId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                      >
                        <option value="">Chọn đơn vị...</option>
                        {classOptions.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                      </select>
                    ) : (
                      <select
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                      >
                        <option value="">Chọn {editRole === 'GiaoVien' ? 'môn học' : 'phòng ban'}...</option>
                        {editRole === 'GiaoVien'
                          ? subjectOptions.map(s => <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>)
                          : departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    )}
                  </div>

                  {/* Role / Position */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Vai trò / Chức vụ <span className="text-red-500">*</span></label>
                    <select
                      value={editPosition}
                      onChange={(e) => setEditPosition(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all"
                    >
                      <option value="Giảng viên">Giảng viên</option>
                      <option value="Trưởng bộ môn">Trưởng bộ môn</option>
                      <option value="Trợ giảng">Trợ giảng</option>
                      <option value="Học sinh">Học sinh</option>
                      <option value="Kỹ thuật viên">Kỹ thuật viên</option>
                      <option value="Y sĩ">Y sĩ</option>
                      <option value="Quản trị viên">Quản trị viên</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 border-t border-gray-200 bg-white flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={editSaving}
                className="px-6 py-2.5 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="editUserForm"
                disabled={editSaving}
                className="px-8 py-2.5 rounded-full text-xs font-semibold bg-[#001d36] text-white shadow-lg flex items-center gap-2 hover:bg-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                {editSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Xác nhận xóa tài khoản</h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.full_name || deletingUser.username || deletingUser.email}</strong>? Thao tác này không thể hoàn tác.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 pb-5 px-5">
              <button onClick={() => { setShowDeleteModal(false); setDeletingUser(null) }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePwModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h2>
              <button onClick={() => setShowChangePwModal(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {changePwError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{changePwError}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
                <input type="password" value={changePwFields.newPassword} onChange={(e) => setChangePwFields(prev => ({ ...prev, newPassword: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400" placeholder="Ít nhất 6 ký tự" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" value={changePwFields.confirmPassword} onChange={(e) => setChangePwFields(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400" placeholder="Nhập lại mật khẩu mới" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowChangePwModal(false)} disabled={changingPw} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
                <button type="submit" disabled={changingPw} className="px-4 py-2 bg-[#004d80] text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">{changingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold"
          style={{ background: toast.type === 'success' ? 'linear-gradient(135deg,#059669,#047857)' : 'linear-gradient(135deg,#dc2626,#b91c1c)', color: '#fff', borderColor: 'transparent' }}
          key={Date.now()}
        >
          <span className="material-symbols-outlined text-[18px]">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/70 hover:text-white font-bold">✕</button>
        </div>,
        document.body
      )}
    </div>
  )
}



