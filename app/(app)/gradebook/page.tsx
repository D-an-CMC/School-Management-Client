'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface TeacherStudentRow {
  id: string
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

const INITIAL_TEACHER_STUDENTS: TeacherStudentRow[] = [
  {
    id: '1',
    name: 'Lê Hải Nam',
    studentId: '20240801',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    freq: ['8.0', '8.5', '8.0', '8.3'],
    midTerm: '8.5',
    finalTerm: '--',
    aiPrediction: '8.4',
    average: '8.3',
  },
  {
    id: '2',
    name: 'Nguyễn Anh Thư',
    studentId: '20240802',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    freq: ['9.5', '9.5', '9.5', '9.5'],
    midTerm: '9.5',
    finalTerm: '--',
    aiPrediction: '9.6',
    average: '9.5',
  },
  {
    id: '3',
    name: 'Quách Gia Huy',
    studentId: '20240805',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    freq: ['4.5', '5.0', '4.5', '4.8'],
    midTerm: '5.0',
    finalTerm: '--',
    aiPrediction: '4.2',
    average: '4.8',
    warning: true,
  },
  {
    id: '4',
    name: 'Trần Bảo Minh',
    studentId: '20240806',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    freq: ['8.5', '9.0', '8.5', '8.8'],
    midTerm: '8.5',
    finalTerm: '--',
    aiPrediction: '8.7',
    average: '8.6',
  },
  {
    id: '5',
    name: 'Phạm Phương Thảo',
    studentId: '20240808',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    freq: ['9.0', '9.0', '8.5', '9.0'],
    midTerm: '9.0',
    finalTerm: '--',
    aiPrediction: '9.1',
    average: '8.9',
  },
]

export default function GradebookPage() {
  const { user } = useAuth()
  const userRole = (user?.role || '').toLowerCase()
  const isStudentRole = userRole === 'student' || userRole === 'hocsinh-phuhuynh' || userRole === 'hocsinhphuhuynh'

  // Teacher View State
  const [students, setStudents] = useState<TeacherStudentRow[]>(INITIAL_TEACHER_STUDENTS)
  const [selectedClass, setSelectedClass] = useState('Lớp 11B2 - Môn Toán')
  const [saveStatus, setSaveStatus] = useState<'draft' | 'published'>('draft')

  const handleScoreChange = (id: string, field: 'freq' | 'midTerm' | 'finalTerm', index: number | undefined, value: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== id) return s
        if (field === 'freq' && typeof index === 'number') {
          const newFreq = [...s.freq]
          newFreq[index] = value
          return { ...s, freq: newFreq }
        }
        return { ...s, [field]: value }
      })
    )
  }

  // ---------------------------------------------------------------------------
  // STUDENT ROLE VIEW (kq/code.html design match)
  // ---------------------------------------------------------------------------
  if (isStudentRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Welcome Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900">Kết quả học tập, {user?.name || 'Minh Anh'}</h2>
            <p className="text-sm text-gray-500 mt-1">Hệ thống đang phân tích dữ liệu mới nhất. Thứ Hai, ngày 12 tháng 10, 2026.</p>
          </section>

          {/* AI ANALYSIS HERO CARD */}
          <section>
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8 items-stretch relative overflow-hidden">
              <div className="flex-1 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-bold flex items-center gap-1.5 uppercase">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    EXCELLENT PROGRESS
                  </span>
                  <h3 className="font-bold text-lg text-[#001d36]">AI Academic Health Analysis</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                  {user?.name || 'Minh Anh'} is maintaining an <span className="font-bold text-[#001d36]">exceptional performance</span> this semester. Based on the latest 4-week data, AI predicts your average score will increase by <span className="text-[#001d36] font-semibold">+0.2</span> by finals. Natural sciences (Math, Physics) show significant breakthroughs; however, focus more on English vocabulary to secure the "Excellent Student" target.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">ĐIỂM TRUNG BÌNH DỰ KIẾN</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#001d36]">8.6</span>
                      <span className="text-green-600 text-xs font-bold flex items-center">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>+0.2
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">ATTENDANCE RATE</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-[#001d36]">98%</span>
                      <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-px bg-gray-100 hidden md:block"></div>

              <div className="md:w-64 flex flex-col items-center justify-center text-center p-4 bg-gray-50/50 rounded-lg">
                <span className="font-bold text-[#001d36] tracking-tighter text-4xl">XUẤT SẮC</span>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 mb-6">THÀNH TÍCH HỌC TẬP</p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#001d36] w-[88%] rounded-full"></div>
                </div>
                <p className="text-xs font-bold text-gray-700">Top 5/45 Students</p>
              </div>
            </div>
          </section>

          {/* SUBJECT PERFORMANCE HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#001d36]">analytics</span>
              <h3 className="text-lg font-bold text-gray-900">Detailed Subject Performance</h3>
            </div>
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition shadow-sm">
              <span className="material-symbols-outlined text-sm mr-2">picture_as_pdf</span>
              Export PDF Report
            </button>
          </div>

          {/* SUBJECT CARDS */}
          <div className="space-y-6">
            {/* MATH CARD */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#001d36] text-white rounded flex items-center justify-center font-bold text-xl">M</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Mathematics</h4>
                    <p className="text-xs text-gray-500">Instructor: Mr. Tran Hoang Nam</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject Average</p>
                  <span className="text-4xl font-bold text-[#001d36]">9.2</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">THƯỜNG XUYÊN</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">9.5</div>
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">8.0</div>
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">9.0</div>
                      <div className="bg-gray-100/50 border border-dashed border-gray-300 rounded py-1 text-center text-sm font-semibold text-gray-400">-</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">X2</span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Giữa kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">9.0</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Cuối kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">9.5</div>
                  </div>
                  <div className="bg-blue-50/60 p-3 rounded border border-blue-200 border-dashed">
                    <p className="text-[10px] font-bold text-[#001d36] uppercase mb-2">Dự báo AI</p>
                    <div className="bg-white border border-blue-200 rounded py-1 text-center text-sm font-bold text-[#001d36]">9.6</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 border-l-4 border-[#001d36] rounded-r-lg flex gap-4">
                  <span className="material-symbols-outlined text-[#001d36] text-xl">lightbulb</span>
                  <p className="text-sm text-gray-600 italic leading-relaxed">
                    "Logical thinking ability is currently at a high level. AI predicts that if you maintain focus in the 3D Geometry chapter, your final exam score will reach at least 9.5."
                  </p>
                </div>
              </div>
            </div>

            {/* LITERATURE CARD */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-500 text-white rounded flex items-center justify-center font-bold text-xl">L</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Literature</h4>
                    <p className="text-xs text-gray-500">Instructor: Ms. Nguyen Mai Phuong</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject Average</p>
                  <span className="text-4xl font-bold text-gray-900">8.4</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">THƯỜNG XUYÊN</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">10</div>
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">7.5</div>
                      <div className="bg-gray-100/50 border border-dashed border-gray-300 rounded py-1 text-center text-sm font-semibold text-gray-400">-</div>
                      <div className="bg-gray-100/50 border border-dashed border-gray-300 rounded py-1 text-center text-sm font-semibold text-gray-400">-</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">X2</span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Giữa kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">8.5</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Cuối kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">8.2</div>
                  </div>
                  <div className="bg-blue-50/60 p-3 rounded border border-blue-200 border-dashed">
                    <p className="text-[10px] font-bold text-[#001d36] uppercase mb-2">Dự báo AI</p>
                    <div className="bg-white border border-blue-200 rounded py-1 text-center text-sm font-bold text-[#001d36]">8.5</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-50 border-l-4 border-[#001d36] rounded-r-lg flex gap-4">
                  <span className="material-symbols-outlined text-[#001d36] text-xl">auto_awesome</span>
                  <p className="text-sm text-gray-600 italic leading-relaxed">
                    "Need to improve writing speed for social discourse essays. Student tends to over-polish which leads to lack of time for the concluding section."
                  </p>
                </div>
              </div>
            </div>

            {/* ENGLISH CARD */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xl">E</div>
                  <div>
                    <h4 className="font-bold text-gray-900">English Language</h4>
                    <p className="text-xs text-gray-500">Instructor: Mr. David Smith</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Subject Average</p>
                  <span className="text-4xl font-bold text-gray-900">7.8</span>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
                  <div className="col-span-1 sm:col-span-2 bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">THƯỜNG XUYÊN</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">9.0</div>
                      <div className="bg-white border border-red-500 rounded py-1 text-center text-sm font-semibold text-red-600">4.5</div>
                      <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">7.0</div>
                      <div className="bg-gray-100/50 border border-dashed border-gray-300 rounded py-1 text-center text-sm font-semibold text-gray-400">-</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold">X2</span>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Giữa kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">8.0</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Cuối kỳ</p>
                    <div className="bg-white border border-gray-200 rounded py-1 text-center text-sm font-semibold">8.5</div>
                  </div>
                  <div className="bg-blue-50/60 p-3 rounded border border-blue-200 border-dashed">
                    <p className="text-[10px] font-bold text-[#001d36] uppercase mb-2">Dự báo AI</p>
                    <div className="bg-white border border-blue-200 rounded py-1 text-center text-sm font-bold text-[#001d36]">8.2</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex gap-4">
                  <span className="material-symbols-outlined text-red-500 text-xl">warning</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Action Recommended:</span>
                    <p className="text-sm text-red-800 italic leading-relaxed">
                      "Low 15-minute test score indicates knowledge gaps in perfect tenses. AI suggests practice 3 additional intensive grammar exercises on this topic next week."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION CARDS */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 pb-8">
              <div className="bg-[#001d36] p-8 rounded-lg flex items-center justify-between cursor-pointer hover:bg-blue-900 transition-all group overflow-hidden relative shadow-sm">
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-white mb-1">Schedule Parent-Teacher Meeting</h4>
                  <p className="text-blue-200 text-sm">Book a direct consultation with the Form Teacher</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-white group-hover:translate-x-2 transition-transform relative z-10">arrow_forward</span>
                <div className="absolute right-0 top-0 w-48 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
              </div>
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-between cursor-pointer hover:border-[#001d36] hover:bg-gray-50 transition-all group shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg font-bold text-[#001d36]">AI Personalized Learning Path</h4>
                    <span className="material-symbols-outlined text-[#001d36] text-xl animate-pulse">auto_awesome</span>
                  </div>
                  <p className="text-gray-500 text-sm">Personalized study roadmap based on current transcript data</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-[#001d36] transition-colors">rocket_launch</span>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-8 text-center flex-shrink-0 mt-auto">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            © 2024 CMC UNIVERSITY SMART SCHOOL MANAGEMENT SYSTEM. BẢO MẬT CẤP ĐỘ DOANH NGHIỆP.
          </p>
        </footer>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // TEACHER / ADMIN ROLE VIEW (grade/code.html design match)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Gradebook Context Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#003366]">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Academic Management</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sổ điểm Học thuật</h2>
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <span className="font-medium text-gray-700">Trường THPT Chuyên CMC</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>Học kỳ II</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>2023-2024</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSaveStatus('draft')}
              className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">drafts</span>
              Lưu bản nháp
            </button>
            <button
              onClick={() => setSaveStatus('published')}
              className="px-4 py-2 rounded-md bg-[#003366] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#004080] transition-all shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              Công bố điểm
            </button>
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Xuất báo cáo
            </button>
          </div>
        </div>

        {/* Bento Summary Grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4">Lớp học & Môn học</p>
            <div className="relative group cursor-pointer">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 group-hover:border-blue-500 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#003366]">groups</span>
                  </div>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="bg-transparent text-lg font-bold text-gray-900 border-none focus:outline-none cursor-pointer"
                  >
                    <option value="Lớp 11B2 - Môn Toán">Lớp 11B2 - Môn Toán</option>
                    <option value="Lớp 10A1 - Môn Toán">Lớp 10A1 - Môn Toán</option>
                    <option value="Lớp 12C3 - Môn Lý">Lớp 12C3 - Môn Lý</option>
                  </select>
                </div>
                <span className="material-symbols-outlined text-gray-400">expand_more</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sĩ số */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sĩ số lớp</p>
              <div className="flex items-baseline justify-between mt-4">
                <span className="text-3xl font-bold text-[#003366]">42/42</span>
                <span className="text-xs font-semibold text-green-500">Đầy đủ</span>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#003366] h-1.5 rounded-full w-full"></div>
              </div>
            </div>

            {/* Hoàn thành */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between relative">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tỷ lệ hoàn thành</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-3xl font-bold text-[#003366]">85%</span>
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-100" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeWidth="3"></circle>
                    <circle className="text-[#003366]" cx="20" cy="20" fill="transparent" r="16" stroke="currentColor" strokeDasharray="100" strokeDashoffset="15" strokeWidth="3"></circle>
                  </svg>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#003366] h-1.5 rounded-full w-[85%]"></div>
              </div>
            </div>

            {/* Dự báo AI */}
            <div className="bg-[#003366] p-6 rounded-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Dự báo ĐTB lớp (AI)</p>
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-3xl font-bold text-white">7.4</span>
                <span className="text-xs text-white/60">Dự báo ổn định</span>
              </div>
              <div className="flex items-center gap-1 text-white/50 font-medium text-[10px] mt-4">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                AI ANALYTICS ACTIVE
              </div>
              <div className="absolute -right-2 -top-2 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>

        {/* Grade Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Học sinh & Mã số</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Điểm thường xuyên (1, 2, 3, 4)</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Điểm giữa kỳ</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Điểm cuối kỳ</th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Dự báo AI (Cuối kỳ)</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">ĐTB</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {students.map(row => (
                  <tr key={row.id} className={`transition-colors ${row.warning ? 'hover:bg-red-50/50 bg-red-50/20' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                          <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">{row.name}</span>
                          <span className="text-[10px] font-semibold text-gray-500">ID: {row.studentId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {row.freq.map((val, idx) => (
                          <input
                            key={idx}
                            type="text"
                            value={val}
                            onChange={e => handleScoreChange(row.id, 'freq', idx, e.target.value)}
                            className={`w-8 h-8 text-center rounded border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#003366] ${
                              row.warning ? 'text-red-600 bg-red-50' : 'text-gray-900 bg-gray-50'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <input
                        type="text"
                        value={row.midTerm}
                        onChange={e => handleScoreChange(row.id, 'midTerm', undefined, e.target.value)}
                        className="w-12 h-8 text-center rounded border border-gray-200 text-sm font-bold text-gray-900 bg-gray-50 focus:outline-none focus:border-[#003366]"
                      />
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <input
                        type="text"
                        value={row.finalTerm}
                        onChange={e => handleScoreChange(row.id, 'finalTerm', undefined, e.target.value)}
                        className="w-12 h-8 text-center rounded border border-gray-200 text-sm text-gray-400 bg-gray-50 focus:outline-none focus:border-[#003366]"
                      />
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${row.warning ? 'text-red-600' : 'text-blue-600'}`}>{row.aiPrediction}</span>
                        <span className={`text-[10px] font-medium ${row.warning ? 'text-red-400/70' : 'text-blue-500/70'}`}>Dự báo</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        row.warning ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-[#003366]'
                      }`}>
                        {row.average}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Hiển thị 1-5 trên tổng số 42 học sinh
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button className="px-3 py-1 rounded bg-[#003366] text-white text-xs font-bold">1</button>
              <button className="px-3 py-1 rounded border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">2</button>
              <button className="px-3 py-1 rounded border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50">3</button>
              <button className="p-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Insights Grid Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Chart/Analysis Card */}
          <div className="col-span-12 lg:col-span-4 bg-[#003366] text-white p-6 rounded-lg shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-4">Phân tích Phổ điểm</p>
              <h3 className="text-lg font-bold mb-4">Mật độ phân bổ</h3>
              <div className="h-32 flex items-end gap-1 mb-4 flex-shrink-0">
                <div className="flex-1 bg-white/20 rounded-t h-[20%] transition-all hover:bg-white/40"></div>
                <div className="flex-1 bg-white/20 rounded-t h-[40%] transition-all hover:bg-white/40"></div>
                <div className="flex-1 bg-white/40 rounded-t h-[70%] transition-all hover:bg-white/60"></div>
                <div className="flex-1 bg-white rounded-t h-[100%]"></div>
                <div className="flex-1 bg-white/60 rounded-t h-[80%] transition-all"></div>
                <div className="flex-1 bg-white/30 rounded-t h-[50%] transition-all"></div>
                <div className="flex-1 bg-white/10 rounded-t h-[30%] transition-all"></div>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Phổ điểm đang tập trung ở mức 7.0 - 8.5. Tỉ lệ học sinh khá giỏi chiếm 68% tổng số.
            </p>
            <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/5 rounded-full border border-white/10"></div>
          </div>

          {/* Legend Card */}
          <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-6">Chú giải dữ liệu</p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-gray-900 mt-1 flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">Dữ liệu thực tế</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Điểm số do giáo viên trực tiếp chấm và nhập hệ thống.</span>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 rounded-full bg-blue-400 mt-1 flex-shrink-0"></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-blue-600">Dự báo AI</span>
                  <span className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Dựa trên lịch sử học tập, mức độ chuyên cần và xu hướng.</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistant Card */}
          <div className="col-span-12 lg:col-span-4 bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[18px]">psychology</span>
                </div>
                <span className="text-sm font-bold text-gray-900">Trợ lý AI CMC</span>
              </div>
              <div className="p-4 bg-white rounded-lg border border-red-100 flex gap-3 items-start shadow-sm">
                <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  Phát hiện <strong>3 học sinh</strong> có nguy cơ tụt hạng trong kỳ thi cuối kỳ sắp tới. Cần có biện pháp hỗ trợ ôn tập kịp thời.
                </p>
              </div>
            </div>
            <button className="mt-4 w-full py-2.5 rounded-md bg-white border border-gray-200 text-[#003366] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
              Xem chi tiết phân tích
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-8 text-center flex-shrink-0 mt-auto">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          © 2024 CMC UNIVERSITY SMART SCHOOL MANAGEMENT SYSTEM. BẢO MẬT CẤP ĐỘ DOANH NGHIỆP.
        </p>
      </footer>
    </div>
  )
}
