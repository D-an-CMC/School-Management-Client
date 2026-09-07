'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAcademic } from '@/lib/academic-context'
import { getStudentStats, getTeacherStats, getClassesCount, getGradeStats, getAverageScoreStats, getStudentAttendanceStats } from '@/lib/api'

export function AdminDashboard() {
    const pathname = usePathname()
    const { selectedSchoolYearId, currentSchoolYear, schoolYears } = useAcademic()
    const [stats, setStats] = useState<{ totalStudents: number; totalTeachers: number; totalClasses: number } | null>(null)
    const [gradeStats, setGradeStats] = useState<{ grade_level: number; class_count: number; student_count: number }[]>([])
    const [avgStats, setAvgStats] = useState<any[]>([])
    const [attendanceStats, setAttendanceStats] = useState<any>(null)
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? undefined

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        Promise.all([
            getStudentStats(),
            getTeacherStats(),
            getClassesCount(effectiveYearId),
            getGradeStats(effectiveYearId),
            getAverageScoreStats(effectiveYearId),
            getStudentAttendanceStats()
        ])
            .then(([studentStats, teacherStats, classesCount, gradeStatsData, avgStatsData, attendanceData]) => {
                if (cancelled) return
                setStats({
                    totalStudents: studentStats?.totalStudents ?? 0,
                    totalTeachers: teacherStats?.totalTeachers ?? 0,
                    totalClasses: classesCount ?? 0,
                })
                setGradeStats(gradeStatsData || [])
                setAvgStats(avgStatsData || [])
                setAttendanceStats(attendanceData || null)
                setLoading(false)
            })
            .catch(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [pathname, effectiveYearId])

    const activeYear = schoolYears.find((y: any) => Number(y.school_year_id) === Number(selectedSchoolYearId)) ||
        currentSchoolYear ||
        null
    const activeYearName = activeYear ? (activeYear.is_current ? `${activeYear.year_name} (hiện tại)` : activeYear.year_name) : ''

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Welcome Section */}
            <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] text-white rounded-lg p-4 md:p-6">
                <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Xin chào, Thầy Hiệu Trưởng</h1>
                <p className="text-xs md:text-sm opacity-90 mb-3 md:mb-4">
                    Chào mừng bạn đến với hệ thống quản lý học tập trường THCS CMC.{activeYearName ? ` Đang xem: ${activeYearName}.` : ''}
                </p>

            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalStudents ?? 0}</div>
                    <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng HS Toàn trường</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalTeachers ?? 0}</div>
                    <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng Giáo viên</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6">
                    <div className="text-lg md:text-2xl font-bold text-gray-900">{loading ? '...' : stats?.totalClasses ?? 0}</div>
                    <div className="text-[10px] md:text-sm text-gray-500 mt-0.5 md:mt-1">Tổng Lớp học</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded text-blue-600 font-bold text-sm md:text-lg">📊</div>
                                <div>
                                    <h3 className="text-sm md:text-base font-semibold text-gray-900">
                                        {selectedGrade ? `Điểm trung bình Khối ${selectedGrade}` : 'Thống kê Điểm trung bình theo Khối'}
                                    </h3>
                                    <p className="text-[10px] md:text-sm text-gray-600 mt-0.5">Dữ liệu được cập nhật từ hệ thống</p>
                                </div>
                            </div>
                            {selectedGrade && (
                                <button
                                    onClick={() => setSelectedGrade(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                                >
                                    <span>←</span> Quay lại
                                </button>
                            )}
                        </div>
                        
                        {/* Chart Area */}
                        <div className="h-64 flex items-end gap-2 md:gap-6 pt-4 border-b border-gray-100 relative mb-4">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-gray-400 pb-6 pr-2 border-r border-gray-100 w-8 text-right">
                                <span>10</span>
                                <span>7.5</span>
                                <span>5</span>
                                <span>2.5</span>
                                <span>0</span>
                            </div>
                            
                            <div className="flex-1 flex items-end justify-around h-full pl-8 pb-6 relative">
                                {loading ? (
                                    <div className="text-sm text-gray-500 self-center">Đang tải biểu đồ...</div>
                                ) : !selectedGrade ? (
                                    // Hiển thị các khối
                                    (avgStats || []).map((grade) => (
                                        <div key={grade.grade_level} className="flex flex-col items-center gap-2 group relative w-1/5 max-w-[60px] h-full justify-end cursor-pointer" onClick={() => setSelectedGrade(grade.grade_level)}>
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                                {grade.average_score.toFixed(2)} điểm
                                            </div>
                                            <div 
                                                className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t transition-all group-hover:from-blue-500 group-hover:to-indigo-300 shadow-sm"
                                                style={{ height: `${(grade.average_score / 10) * 100}%`, minHeight: '2%' }}
                                            ></div>
                                            <span className="text-[10px] md:text-xs text-gray-600 font-medium whitespace-nowrap absolute -bottom-6">Khối {grade.grade_level}</span>
                                        </div>
                                    ))
                                ) : (
                                    // Hiển thị các lớp trong khối
                                    (avgStats.find(g => g.grade_level === selectedGrade)?.classes || []).map((cls: any, i: number) => (
                                        <div key={i} className="flex flex-col items-center gap-2 group relative flex-1 max-w-[40px] h-full justify-end">
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                                {cls.average_score.toFixed(2)} điểm
                                            </div>
                                            <div 
                                                className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t transition-all group-hover:from-emerald-500 group-hover:to-teal-300 shadow-sm"
                                                style={{ height: `${(cls.average_score / 10) * 100}%`, minHeight: '2%' }}
                                            ></div>
                                            <span className="text-[9px] md:text-[11px] text-gray-600 font-medium whitespace-nowrap absolute -bottom-6">{cls.class_name}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Grade Stats Table & Attendance */}
                <div className="space-y-4 md:space-y-6">
                    {/* Attendance Stats */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Tỉ lệ đi học hôm nay</h3>
                        <div className="flex items-center justify-between p-3 md:p-4 bg-green-50 rounded-lg border border-green-100">
                            <div>
                                <p className="text-xs text-green-700 font-medium">Toàn trường</p>
                                <p className="text-lg md:text-2xl font-bold text-green-700">
                                    {loading ? '...' : attendanceStats ? `${((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)}%` : '0%'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] md:text-xs text-green-600">Có mặt: {attendanceStats?.present ?? 0}</p>
                                <p className="text-[10px] md:text-xs text-gray-500">Tổng: {attendanceStats?.total ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Grade Stats Table */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                        <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Thống kê theo khối</h3>
                        <div className="overflow-x-auto -mx-4 md:mx-0">
                            <table className="w-full text-xs md:text-sm min-w-[280px]">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">KHỐI</th>
                                        <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">LỚP</th>
                                        <th className="text-right py-2 md:py-3 px-2 md:px-4 font-semibold text-gray-900 text-[10px] md:text-xs">HS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(gradeStats || []).map((g) => (
                                        <tr key={g.grade_level} className="border-b border-gray-100">
                                            <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 font-medium">Khối {g.grade_level}</td>
                                            <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 text-right">{g.class_count}</td>
                                            <td className="py-2 md:py-3 px-2 md:px-4 text-gray-900 text-right">{g.student_count}</td>
                                        </tr>
                                    ))}
                                    {(!gradeStats || gradeStats.length === 0) && !loading && (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">Chưa có dữ liệu</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
