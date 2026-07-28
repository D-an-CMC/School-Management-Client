'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getStudentStats, getTeacherStats, getClassesCount, getGradeStats, } from '@/lib/api'

export function AdminDashboard() {
    const pathname = usePathname()
    const [stats, setStats] = useState<{ totalStudents: number; totalTeachers: number; totalClasses: number } | null>(null)
    const [gradeStats, setGradeStats] = useState<{ grade_level: number; class_count: number; student_count: number }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        Promise.all([
            getStudentStats(),
            getTeacherStats(),
            getClassesCount(),
            getGradeStats(),
        ])
            .then(([studentStats, teacherStats, classesCount, gradeStatsData]) => {
                if (cancelled) return
                setStats({
                    totalStudents: studentStats?.totalStudents ?? 0,
                    totalTeachers: teacherStats?.totalTeachers ?? 0,
                    totalClasses: classesCount ?? 0,
                })
                setGradeStats(gradeStatsData || [])
                setLoading(false)
            })
            .catch(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [pathname])

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Welcome Section */}
            <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] text-white rounded-lg p-4 md:p-6">
                <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Xin chào, Thầy Hiệu Trưởng</h1>
                <p className="text-xs md:text-sm opacity-90 mb-3 md:mb-4">
                    Chào mừng bạn đến với hệ thống quản lý học tập trường THCS CMC.
                </p>
                <button className="bg-white text-[#0B3D5C] px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold text-xs md:text-sm hover:bg-gray-100 transition-colors">
                    Xem Báo Cáo Toàn Trường
                </button>
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
                        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                            <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 bg-blue-100 rounded text-blue-600 font-bold text-sm md:text-lg">📊</div>
                            <div>
                                <h3 className="text-sm md:text-base font-semibold text-gray-900">Thống kê Học tập</h3>
                                <p className="text-[10px] md:text-sm text-gray-600 mt-0.5">Dữ liệu được cập nhật từ hệ thống</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Grade Stats Table */}
                <div className="space-y-4 md:space-y-6">
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
