'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getUsers, getStudents, getTeachers, updateUser, getClasses, createUser, getStudentCodePreview, getSchoolYears } from '@/lib/api'

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
  full_name?: string
  student_code?: string
  gender?: string
  date_of_birth?: string
}

const ROLE_OPTIONS = ['HocSinh-PhuHuynh', 'GiaoVien', 'Admin'] as const
const STATUS_OPTIONS = ['active', 'inactive'] as const

export default function UserManagementPage() {
  const { user } = useAuth()
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
  const [schoolYears, setSchoolYears] = useState<{ school_year_id: number; year_name: string; start_date?: string; end_date?: string }[]>([])
  const pageSize = 10
  const [showAddModal, setShowAddModal] = useState(false)
  const [formRole, setFormRole] = useState('HocSinh-PhuHuynh')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formFullName, setFormFullName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formGender, setFormGender] = useState('')
  const [formDob, setFormDob] = useState('')
  const [formGradeLevel, setFormGradeLevel] = useState<number | ''>('')
  const [formSchoolYearId, setFormSchoolYearId] = useState<number | ''>('')
  const [formClassId, setFormClassId] = useState<number | ''>('')
  const [formStudentCode, setFormStudentCode] = useState('')
  const [formTeacherCode, setFormTeacherCode] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const gradeLevels = useMemo(() => [...new Set(classOptions.map(c => c.grade_level))].sort((a, b) => a - b), [classOptions])
  const classesForSelectedGrade = useMemo(
    () => {
      let list = classOptions
      if (formGradeLevel !== '') list = list.filter(c => c.grade_level === formGradeLevel)
      if (formSchoolYearId !== '') list = list.filter(c => c.school_year_id === formSchoolYearId)
      return list
    },
    [classOptions, formGradeLevel, formSchoolYearId]
  )

  useEffect(() => {
    if (formRole !== 'HocSinh-PhuHuynh') {
      setFormStudentCode('')
      setFormEmail('')
    }
  }, [formRole])

  useEffect(() => {
    if (formRole !== 'HocSinh-PhuHuynh') return
    if (formClassId === '' || formClassId === 0) {
      setFormStudentCode('')
      setFormEmail('')
      return
    }
    getStudentCodePreview(formClassId, formSchoolYearId || undefined).then(res => {
      if (res) {
        setFormStudentCode(res.student_code)
        setFormEmail(res.email)
      }
    })
  }, [formClassId, formSchoolYearId, formRole])

  const openAddModal = () => {
    setFormRole('HocSinh-PhuHuynh')
    setFormEmail('')
    setFormPassword('')
    setFormFullName('')
    setFormPhone('')
    setFormGender('')
    setFormDob('')
    setFormGradeLevel('')
    setFormSchoolYearId('')
    setFormClassId('')
    setFormStudentCode('')
    setFormTeacherCode('')
    setFormDepartment('')
    setFormError('')
    setFieldErrors({})
    setShowAddModal(true)
  }

  const closeAddModal = () => setShowAddModal(false)

  const validate = () => {
    const errors: Record<string, string> = {}

    // Bat buoc nhap day du
    if (!formFullName.trim()) errors.fullName = 'Vui long nhap ho ten'
    if (!formPassword) errors.password = 'Vui long nhap mat khau'
    else if (formPassword.length < 6) errors.password = 'Mat khau toi thieu 6 ky tu'

    // So dien thoai 10 so neu co nhap
    if (formPhone && !/^\d{10}$/.test(formPhone)) {
      errors.phone = 'So dien thoai phai dung 10 chu so'
    }

    // Hoc sinh phai chon nam hoc, khoi, lop
    if (formRole === 'HocSinh-PhuHuynh') {
      if (!formSchoolYearId && formSchoolYearId !== 0) errors.schoolYearId = 'Vui long chon nam hoc'
      if (!formGradeLevel && formGradeLevel !== 0) errors.gradeLevel = 'Vui long chon khoi'
      if (!formClassId && formClassId !== 0) errors.classId = 'Vui long chon lop'
    }

    // Ngay sinh khong duoc lon hon hom nay
    if (formDob) {
      const today = new Date()
      const selected = new Date(formDob)
      if (selected > today) {
        errors.dob = 'Ngay sinh khong duoc vuot qua ngay hien tai'
      }
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
        if (formClassId !== '') body.class_id = Number(formClassId)
        body.student_code = formStudentCode || undefined
      }
      if (formRole === 'GiaoVien') {
        body.teacher_code = formTeacherCode || undefined
        body.department = formDepartment || undefined
      }
      const res = await createUser(body)
      if (!res.success) {
        setFormError(res.error || 'Tao nguoi dung that bai')
        setSubmitting(false)
        return
      }
      closeAddModal()
      await loadUsers()
    } catch (err: any) {
      setFormError(err.message || 'Loi khong xac dinh')
      setSubmitting(false)
    }
  }

  const clearFilters = () => {
    setRoles([]); setStatuses([]); setSelectedGrade(null); setSelectedClass(null); setPage(1)
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    getClasses().then(r => {
      const list = (r.data || []).map((c: any) => ({ class_id: c.class_id, class_name: c.class_name, grade_level: c.grade_level, school_year_id: c.school_year_id }))
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
      getUsers({ page: 1, limit: 500 }),
      getStudents({ page: 1, limit: 500 }),
      getTeachers({ page: 1, limit: 500 }),
    ])
    const studentRows: UserRow[] = (sRes.data || []).map((s: any) => ({
      user_id: s.student_id,
      email: s.email || '',
      username: s.full_name || '',
      phone: s.phone || '',
      is_active: s.status === 'active',
      role_id: 3,
      role_name: 'HocSinh-PhuHuynh',
      class_id: s.class_id,
      class_name: s.class_name || '',
      full_name: s.full_name,
      student_code: s.student_code,
      date_of_birth: s.date_of_birth,
    }))
    const teacherRows: UserRow[] = (tRes.data || []).map((t: any) => ({
      user_id: t.teacher_id,
      email: t.email || '',
      username: t.full_name || '',
      phone: t.phone || '',
      is_active: true,
      role_id: 2,
      role_name: 'GiaoVien',
      full_name: t.full_name,
      date_of_birth: t.date_of_birth,
      class_name: t.homeroom_class_name || 'Giao vien',
      student_code: t.teacher_code,
    }))
    const userRows: UserRow[] = (uRes.data || [])
      .filter((u: any) => (u.role_name || '') === 'Admin')
      .map((u: any) => ({
        user_id: u.user_id,
        email: u.email,
        username: u.username || u.email,
        phone: u.phone || '',
        is_active: u.is_active ?? true,
        role_id: u.role_id,
        role_name: u.role_name || '',
        date_of_birth: u.date_of_birth || '',
      }))
    setAllUsers([...studentRows, ...teacherRows, ...userRows])
    setPage(1)
    setLoading(false)
  }

  const filtered = useMemo(() => {
    let result = allUsers
    if (roles.length > 0) {
      result = result.filter((u) => roles.includes(u.role_name || ''))
    }
    if (statuses.length > 0) {
      result = result.filter((u) => statuses.includes(u.is_active ? 'active' : 'inactive'))
    }
    if (selectedGrade !== null) {
      result = result.filter((u) => {
        const cls = classOptions.find(c => c.class_id === u.class_id)
        return cls ? cls.grade_level === selectedGrade : false
      })
    }
    if (selectedClass !== null) {
      result = result.filter((u) => u.class_id === selectedClass)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          (u.username || u.full_name || '').toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, allUsers, roles, statuses, selectedGrade, selectedClass, classOptions])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const filteredPageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const roleLabel: Record<string, string> = {
    Admin: 'Quan tri',
    GiaoVien: 'Giao vien',
    'HocSinh-PhuHuynh': 'Hoc sinh',
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Quan ly nguoi dung
        </h1>
        <p className="text-xs md:text-sm text-gray-900">Quan ly nhan su toan truong</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-blue-600 mb-0.5 md:mb-2">
            {allUsers.filter((u) => (u.role_name || '') === 'HocSinh-PhuHuynh').length}
          </div>
          <div className="text-[10px] md:text-sm text-gray-900">Hoc sinh</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-green-600 mb-0.5 md:mb-2">
            {allUsers.filter((u) => (u.role_name || '') === 'GiaoVien').length}
          </div>
          <div className="text-[10px] md:text-sm text-gray-900">Giao vien</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-purple-600 mb-0.5 md:mb-2">
            {allUsers.filter((u) => (u.role_name || '') === 'Admin').length}
          </div>
          <div className="text-[10px] md:text-sm text-gray-900">Quan tri</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
          <div className="text-lg md:text-3xl font-bold text-orange-600 mb-0.5 md:mb-2">{allUsers.length}</div>
          <div className="text-[10px] md:text-sm text-gray-900">Tong nguoi dung</div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-6 lg:mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">&#128270;</span>
          <input
            type="text"
            placeholder="Tim kiem ten, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 text-gray-900 text-sm"
          />
        </div>
        <div className="relative inline-block align-top" ref={filterRef}>
          <button
            onClick={() => setShowFilter(prev => !prev)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded font-medium text-xs md:text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline-block mr-1 -mt-0.5"><path d="M3 3h18l-7 8v8l-4 2v-8L3 3z"/></svg>Loc
          </button>
          {showFilter && (
            <div className="absolute right-full -top-16 mr-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 w-[320px]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-900">Bo loc</span>
                <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-700">Xoa het</button>
              </div>
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Vai tro</div>
                {ROLE_OPTIONS.map(opt => {
                  const label = roleLabel[opt]
                  const checked = roles.includes(opt)
                  return (
                    <label key={opt} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={e => setRoles(prev => e.target.checked ? [...prev, opt] : prev.filter(r => r !== opt))} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-xs text-gray-700">{label}</span>
                    </label>
                  )
                })}
              </div>
              <div className="mb-3 border-t border-gray-100 pt-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Trang thai</div>
                {STATUS_OPTIONS.map(opt => {
                  const label = opt === 'active' ? 'Hoat dong' : 'Bi khoa'
                  const checked = statuses.includes(opt)
                  return (
                    <label key={opt} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={e => setStatuses(prev => e.target.checked ? [...prev, opt] : prev.filter(s => s !== opt))} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-xs text-gray-700">{label}</span>
                    </label>
                  )
                })}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Khoi</div>
                {gradeLevels.map(gl => {
                  const checked = selectedGrade === gl
                  return (
                    <label key={gl} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={e => {
                        setSelectedGrade(e.target.checked ? gl : null)
                        setSelectedClass(null)
                      }} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      <span className="text-xs text-gray-700">Khoi {gl}</span>
                    </label>
                  )
                })}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs font-semibold text-gray-700 mb-1">Lop</div>
                <select
                  value={selectedClass ?? ''}
                  onChange={e => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
                  disabled={selectedGrade === null}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="">{selectedGrade === null ? 'Chon khoi truoc' : 'Tat ca lop'}</option>
                  {classOptions.filter(c => selectedGrade === null || c.grade_level === selectedGrade).map(c => (
                    <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <button onClick={openAddModal} className="px-3 md:px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm">
          &#10133; Them nguoi dung
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Dang tai...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">Ma</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">Ho ten</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">Lop hoc</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden md:table-cell">Email</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden lg:table-cell">Ngay sinh</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">Trang thai</th>
                  <th className="px-3 md:px-6 py-2 md:py-4 text-left font-semibold text-gray-900 text-[10px] md:text-xs">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {filteredPageItems.map((u) => (
                  <tr key={`${u.role_name}-${u.user_id}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-2 md:py-4 font-mono text-gray-900 text-[10px] md:text-sm">
                      {u.student_code || u.full_name || `ID:${u.user_id}`}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 font-medium text-gray-900 text-[10px] md:text-sm">
                      {u.username || u.full_name || u.email}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-sm">
                      {u.class_name || (roleLabel[u.role_name || ''] || u.role_name || '-')}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-sm hidden md:table-cell">
                      {u.email || '-'}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4 text-gray-900 text-[10px] md:text-sm hidden lg:table-cell">
                      {u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <span className={`inline-block px-1.5 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-semibold rounded-full ${
                        u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.is_active ? 'Hoat dong' : 'Bi khoa'}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-2 md:py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === u.user_id ? null : u.user_id)}
                          className="text-gray-600 hover:text-gray-900 text-sm md:text-lg p-1"
                        >
                          &#8943;
                        </button>
                        {openMenuId === u.user_id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px] py-1">
                              <button
                                onClick={() => { setOpenMenuId(null); alert('Chuc nang sua thong tin dang phat trien'); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Sua thong tin
                              </button>
                              <button
                                onClick={() => { setOpenMenuId(null); alert('Chuc nang doi mat khau dang phat trien'); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Doi mat khau
                              </button>
                              <button
                                onClick={async () => {
                                  setOpenMenuId(null)
                                  const newActive = !u.is_active
                                  await updateUser(u.user_id, { is_active: newActive })
                                  setAllUsers((prev) => prev.map((x) => (x.user_id === u.user_id ? { ...x, is_active: newActive } : x)))
                                }}
                                className={(u.is_active ? "w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50" : "w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-green-600 hover:bg-green-50")}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  {u.is_active
                                    ? <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2.5" />
                                    : <polyline points="20 6 9 17 4 12" />
                                  }
                                </svg>
                                {u.is_active ? 'Khoa tai khoan' : 'Mo khoa tai khoan'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Khong tim thay nguoi dung
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs md:text-sm text-gray-900">
        <div>
          Hien thi {filtered.length > 0 ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, filtered.length)} / {filtered.length} nguoi dung
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm"
          >Truoc</button>
          {filtered.length > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={"px-2 md:px-3 py-1 border rounded text-xs md:text-sm " + (p === safePage ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50")}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm"
          >Sau</button>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Them nguoi dung moi</h2>
              <button onClick={closeAddModal} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{formError}</div>}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Vai tro</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
                  <option value="HocSinh-PhuHuynh">Hoc sinh</option>
                  <option value="GiaoVien">Giao vien</option>
                  <option value="Admin">Quan tri</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ho ten</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => {
                      setFormFullName(e.target.value)
                      if (fieldErrors.fullName) setFieldErrors(prev => { const n = { ...prev }; delete n.fullName; return n })
                    }}
                    className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.fullName ? 'border-red-400' : '')}
                    placeholder="Nguyen Van A"
                  />
                  {fieldErrors.fullName && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mat khau <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => {
                      setFormPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors(prev => { const n = { ...prev }; delete n.password; return n })
                    }}
                    required
                    className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.password ? 'border-red-400' : '')}
                    placeholder="It nhat 6 ky tu"
                  />
                  {fieldErrors.password && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.password}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">So dien thoai</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(e.target.value)
                      if (fieldErrors.phone) setFieldErrors(prev => { const n = { ...prev }; delete n.phone; return n })
                    }}
                    className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.phone ? 'border-red-400' : '')}
                    placeholder="0912345678"
                  />
                  {fieldErrors.phone && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ngay sinh</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formDob}
                      onChange={(e) => {
                        setFormDob(e.target.value)
                        if (fieldErrors.dob) setFieldErrors(prev => { const n = { ...prev }; delete n.dob; return n })
                      }}
                      className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.dob ? 'border-red-400' : '')}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">&#128197;</span>
                  </div>
                  {fieldErrors.dob && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.dob}</p>}
                </div>
              </div>

              {formRole === 'HocSinh-PhuHuynh' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nam hoc</label>
                    <select
                      value={formSchoolYearId}
                      onChange={(e) => {
                        setFormSchoolYearId(e.target.value ? Number(e.target.value) : '')
                        setFormClassId(''); setFormStudentCode(''); setFormEmail('')
                        if (fieldErrors.schoolYearId) setFieldErrors(prev => { const n = { ...prev }; delete n.schoolYearId; return n })
                      }}
                      className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.schoolYearId ? 'border-red-400' : '')}
                    >
                      <option value="">-- Chon nam hoc --</option>
                      {(schoolYears || []).map((sy: any) => (
                        <option key={sy.school_year_id} value={sy.school_year_id}>{sy.year_name}</option>
                      ))}
                    </select>
                    {fieldErrors.schoolYearId && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.schoolYearId}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Khoi</label>
                      <select
                        value={formGradeLevel}
                        onChange={(e) => {
                          setFormGradeLevel(e.target.value ? Number(e.target.value) : '')
                          setFormClassId(''); setFormStudentCode(''); setFormEmail('')
                          if (fieldErrors.gradeLevel) setFieldErrors(prev => { const n = { ...prev }; delete n.gradeLevel; return n })
                        }}
                        className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.gradeLevel ? 'border-red-400' : '')}
                      >
                        <option value="">-- Chon khoi --</option>
                        {(gradeLevels || []).map((gl: number) => (
                          <option key={gl} value={gl}>Khoi {gl}</option>
                        ))}
                      </select>
                      {fieldErrors.gradeLevel && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.gradeLevel}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Lop</label>
                      <select
                        value={formClassId}
                        onChange={(e) => {
                          setFormClassId(e.target.value ? Number(e.target.value) : '')
                          if (fieldErrors.classId) setFieldErrors(prev => { const n = { ...prev }; delete n.classId; return n })
                        }}
                        disabled={formGradeLevel === ''}
                        className={"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 " + (fieldErrors.classId ? 'border-red-400' : '') + (formGradeLevel === '' ? ' bg-gray-100 text-gray-400' : '')}
                      >
                        <option value="">-- Chon lop --</option>
                        {(classesForSelectedGrade || []).map((c: any) => (
                          <option key={c.class_id} value={c.class_id}>{c.class_name}</option>
                        ))}
                      </select>
                      {fieldErrors.classId && <p className="text-red-500 text-xs mt-0.5">{fieldErrors.classId}</p>}
                      {formGradeLevel === '' && <p className="text-[10px] text-gray-400 mt-1">Chon khoi truoc</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ma hoc sinh</label>
                    <input
                      type="text"
                      value={formStudentCode}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="text"
                      value={formEmail}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-gray-50"
                    />
                  </div>
                </>
              )}

              {formRole === 'GiaoVien' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Ma giao vien</label>
                    <input
                      type="text"
                      value={formTeacherCode}
                      onChange={(e) => setFormTeacherCode(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                      placeholder="GV001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Bo mon</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
                      placeholder="Toan, Ly, Hoa..."
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeAddModal} disabled={submitting} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">Huy</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? 'Dang tao...' : 'Tao nguoi dung'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
