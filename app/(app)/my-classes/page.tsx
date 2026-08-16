'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useAcademic } from '@/lib/academic-context'
import { getClasses, getClassStudents, getMyStudentInfo } from '@/lib/api'

export default function MyClassesPage() {
  const { user } = useAuth()
  const { selectedSchoolYearId } = useAcademic()
  const isTeacher = user?.role === 'teacher'
  const teacherId = (user as any)?.teacherId
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [myClassInfo, setMyClassInfo] = useState<any>(null)
  const [classStudents, setClassStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isTeacher && teacherId) {
      setLoading(true)
      getClasses({ teacherId, limit: 50, schoolYearId: selectedSchoolYearId ?? undefined })
        .then((res) => { setClasses(res?.data ?? []) })
        .catch(() => {})
        .finally(() => { setLoading(false) })
    } else if (!isTeacher) {
      setLoading(true)
      getMyStudentInfo()
        .then((info) => {
          setMyClassInfo(info)
          if (info?.class_id) {
            getClassStudents(info.class_id).then((s) => setClassStudents(s ?? []))
          }
        })
        .catch(() => {})
        .finally(() => { setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [isTeacher, teacherId, selectedSchoolYearId])

  const handleClassClick = (classId: number) => {
    setSelectedClass(classId)
    getClassStudents(classId).then((s) => setStudents(s ?? [])).catch(() => {})
  }

  // STUDENT VIEW
  if (!isTeacher) {
    if (loading) return <div className="p-6 text-sm text-gray-500">Đang tải...</div>
    if (!myClassInfo?.class_id) {
      return <div className="p-6 text-sm text-gray-500">Chưa được xếp lớp</div>
    }
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
        <div className="mb-6">
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Lớp học của tôi</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">
            {myClassInfo.class_info?.class_name} • {myClassInfo.class_info?.grade_name}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">GV Chủ nhiệm</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{myClassInfo.class_info?.homeroom_teacher_name || 'Chưa có'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Sĩ số</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{classStudents.length} học sinh</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Mã HS</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{myClassInfo.student_code || '—'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Danh sách học sinh</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">#</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">HỌC SINH</th>
                  <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">MÃ HS</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s: any, idx) => (
                  <tr key={s.student_id} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-600">{idx + 1}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{s.full_name}</td>
                    <td className="py-2 px-3 text-gray-600">{s.student_code || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // TEACHER VIEW
  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      <div className="mb-6 md:mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Danh sách lớp phụ trách</h1>
        <p className="text-xs md:text-sm text-gray-600">Xem tất cả các lớp quản lý</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <>
          {/* Class Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {classes.map((cls) => (
              <button
                key={cls.class_id}
                onClick={() => handleClassClick(cls.class_id)}
                className={`rounded-lg border p-4 md:p-5 text-left transition ${
                  selectedClass === cls.class_id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900">{cls.class_name}</h3>
                  <span className="text-lg font-bold text-[#0066CC]">{cls.student_count || 0}</span>
                </div>
                <p className="text-xs text-gray-600">{cls.grade_name || ''}</p>
                <p className="text-xs text-gray-600">GV: {cls.homeroom_teacher_name || '—'}</p>
              </button>
            ))}
            {classes.length === 0 && (
              <p className="text-sm text-gray-500">Chưa được phân công lớp nào</p>
            )}
          </div>

          {/* Student Detail Table */}
          {selectedClass && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Chi tiết học sinh</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs md:text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">MÃ HS</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">HỌC SINH</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px]">GIỚI TÍNH</th>
                      <th className="text-left py-2 px-3 font-bold text-gray-700 uppercase text-[10px] hidden md:table-cell">NGÀY SINH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.student_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600 text-xs">{s.student_code || '-'}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700">
                              {s.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 text-xs md:text-sm">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-xs">{s.gender || '-'}</td>
                        <td className="py-2 px-3 text-gray-600 text-xs hidden md:table-cell">
                          {s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString('vi-VN') : '-'}
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-sm text-gray-500">Chưa có học sinh</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
