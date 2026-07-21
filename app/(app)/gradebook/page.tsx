'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { TeacherGradebook } from '@/components/gradebook/TeacherGradebook'

interface SubjectGrade {
 subject: string
 abbr: string
 color: string
 bgColor: string
 freq: number[]
 mid: number
 final: number
 aiPrediction: number
 average: number
}

const SUBJECT_GRADES: SubjectGrade[] = [
 { subject: 'Toán học', abbr: 'TOÁN', color: 'text-blue-800', bgColor: 'bg-blue-100', freq: [8.5, 9.0, 8.0, 8.5], mid: 8.5, final: 9.0, aiPrediction: 9.2, average: 8.8 },
 { subject: 'Ngữ văn', abbr: 'VĂN', color: 'text-rose-800', bgColor: 'bg-rose-100', freq: [7.5, 8.0, 8.0, 7.0], mid: 7.5, final: 8.5, aiPrediction: 8.4, average: 7.9 },
 { subject: 'Tiếng Anh', abbr: 'ANH', color: 'text-amber-800', bgColor: 'bg-amber-100', freq: [9.5, 10, 9.5, 9.0], mid: 9.5, final: 9.5, aiPrediction: 9.8, average: 9.6 },
 { subject: 'Vật lý', abbr: 'VẬT', color: 'text-cyan-800', bgColor: 'bg-cyan-100', freq: [8.0, 8.5, 7.5, 8.0], mid: 8.0, final: 8.0, aiPrediction: 8.2, average: 8.0 },
 { subject: 'Hóa học', abbr: 'HÓA', color: 'text-purple-800', bgColor: 'bg-purple-100', freq: [7.0, 7.5, 7.0, 8.0], mid: 7.5, final: 7.0, aiPrediction: 7.5, average: 7.3 },
 { subject: 'Sinh học', abbr: 'SINH', color: 'text-green-800', bgColor: 'bg-green-100', freq: [8.5, 8.0, 9.0, 8.5], mid: 8.5, final: 8.5, aiPrediction: 8.7, average: 8.5 },
 { subject: 'Lịch sử', abbr: 'SỬ', color: 'text-orange-800', bgColor: 'bg-orange-100', freq: [9.0, 8.5, 9.0, 9.5], mid: 9.0, final: 9.0, aiPrediction: 9.3, average: 9.1 },
 { subject: 'Địa lý', abbr: 'ĐỊA', color: 'text-emerald-800', bgColor: 'bg-emerald-100', freq: [8.0, 8.0, 8.5, 8.0], mid: 8.0, final: 8.0, aiPrediction: 8.1, average: 8.1 },
]

export default function GradebookPage() {
 const { user } = useAuth()
 const isTeacher = user?.role === 'teacher'
 const [selectedSemester, setSelectedSemester] = useState('1')
 const [selectedYear, setSelectedYear] = useState('2023 - 2024')

 if (isTeacher) {
   return <TeacherGradebook />
 }

 return (
   <div className="p-4 lg:p-10 space-y-6 max-w-[1600px] mx-auto">

     {/* ── Page Title Section ── */}
     <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
       <div className="space-y-1">
         <h1 className="font-headline-xl text-headline-xl text-on-background font-extrabold uppercase">
           Sổ điểm học tập
         </h1>
         <div className="flex items-center gap-3 flex-wrap">
           <span className="text-on-surface-variant font-bold text-sm">Trường THPT Chuyên CMC</span>
           <span className="text-outline-variant">•</span>
           <div className="relative">
             <select
               value={selectedSemester}
               onChange={(e) => setSelectedSemester(e.target.value)}
               className="bg-transparent border border-outline-variant rounded-md py-1 pl-2 pr-7 font-bold text-sm text-on-surface-variant appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
             >
               <option value="1" className="text-on-background">Học kỳ I</option>
               <option value="2" className="text-on-background">Học kỳ II</option>
             </select>
             <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs leading-none">▼</span>
           </div>
           <div className="relative">
             <select
               value={selectedYear}
               onChange={(e) => setSelectedYear(e.target.value)}
               className="bg-transparent border border-outline-variant rounded-md py-1 pl-2 pr-7 font-bold text-sm text-on-surface-variant appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
             >
               <option value="2023 - 2024" className="text-on-background">2023 - 2024</option>
               <option value="2024 - 2025" className="text-on-background">2024 - 2025</option>
             </select>
             <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-xs leading-none">▼</span>
           </div>
         </div>
       </div>

       <div className="flex flex-wrap gap-3">
         <div className="px-6 py-2.5 bg-white border border-outline-variant rounded-lg flex items-center gap-2 font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)]">
           <span className="text-sm font-medium">Trạng thái:</span>
           <span className="flex items-center gap-1">
             <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
             <span>Đã công bố</span>
           </span>
         </div>
       </div>
     </div>

     {/* ── Student Info Section ── */}
     <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
       <div>
         <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Sổ điểm cá nhân - CMC Secondary School</h2>
         <p className="font-body-md text-body-md text-on-surface-variant">
           Học sinh: <span className="font-bold text-on-surface">Dang Mai</span>
           <span className="mx-2 opacity-30">|</span>
           Lớp: <span className="font-bold text-on-surface">6A1</span>
           <span className="mx-2 opacity-30">|</span>
           Năm học: <span className="font-bold text-on-surface">2023 - 2024</span>
         </p>
       </div>
     </div>

     {/* ── Grade Table ── */}
     <div className="bg-white rounded-xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
       <div className="overflow-x-auto">
         <table className="w-full border-collapse">
           <thead>
             <tr className="bg-surface-container-highest">
               <th className="p-4 font-label-sm text-label-sm font-bold text-black text-left uppercase tracking-wider bg-surface-container-high w-56">
                 Môn học
               </th>
               <th className="p-3 font-label-sm text-label-sm font-bold text-black text-center uppercase tracking-wider" colSpan={4}>
                 Đánh giá thường xuyên
               </th>
               <th className="p-3 font-label-sm text-label-sm font-bold text-black text-center uppercase tracking-wider w-24">
                 Giữa kỳ
               </th>
               <th className="p-3 font-label-sm text-label-sm font-bold text-black text-center uppercase tracking-wider w-24">
                 Cuối kỳ
               </th>
               <th className="p-3 font-label-sm text-label-sm font-bold text-black text-center uppercase tracking-wider bg-secondary-fixed/10 w-32">
                 <span className="flex items-center justify-center gap-1">
                   <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                   AI Dự đoán
                 </span>
               </th>
               <th className="p-3 font-label-sm text-label-sm text-center uppercase tracking-wider bg-primary-container text-on-primary-container w-20">
                 ĐTB
               </th>
             </tr>
           </thead>
           <tbody className="font-body-md text-body-md text-on-surface">
             {SUBJECT_GRADES.map((row) => (
               <tr key={row.subject} className="hover:bg-surface-container-low transition-colors">
                 <td className="p-4 font-bold">
                   <span className={cn('px-2 py-0.5 rounded-md text-xs font-bold mr-2', row.bgColor, row.color)}>
                     {row.abbr}
                   </span>
                   {row.subject}
                 </td>
                 {row.freq.map((val, i) => (
                   <td key={i} className="p-3 text-center">{val}</td>
                 ))}
                 <td className="p-3 text-center font-bold">{row.mid}</td>
                 <td className="p-3 text-center font-bold">{row.final}</td>
                 <td className="p-3 text-center italic text-secondary font-semibold bg-secondary-fixed/5">
                   ~ {row.aiPrediction}
                 </td>
                 <td className="p-3 text-center font-extrabold bg-primary-container/5">
                   {row.average}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>

     {/* ── Summary Analysis Section ── */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
       <div className="bg-primary-fixed text-on-primary-fixed p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
         <p className="font-label-sm text-label-sm uppercase opacity-70 mb-1">Điểm trung bình học kỳ</p>
         <div className="flex items-end gap-2">
           <span className="font-headline-lg text-headline-lg leading-none">8.4</span>
           <span className="font-body-md bg-white/20 px-2 py-0.5 rounded-lg">Khá Giỏi</span>
         </div>
       </div>
       <div className="bg-secondary-fixed text-on-secondary-fixed p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
         <p className="font-label-sm text-label-sm uppercase opacity-70 mb-1">Môn cao nhất</p>
         <div className="flex items-center gap-2">
           <span className="font-headline-lg text-headline-lg">9.6</span>
           <span className="font-title-md">Tiếng Anh</span>
         </div>
       </div>
       <div className="bg-tertiary-fixed text-on-tertiary-fixed p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
         <p className="font-label-sm text-label-sm uppercase opacity-70 mb-1">Xếp hạng lớp</p>
         <div className="flex items-center gap-2">
           <span className="font-headline-lg text-headline-lg">05</span>
           <span className="font-title-md">Trên 45 HS</span>
         </div>
       </div>
     </div>

     {/* ── Footer / Notes ── */}
     <footer className="bg-white p-6 rounded-xl border-dashed border-2 border-black">
       <h4 className="font-title-md text-title-md text-black font-bold mb-xs">Ghi chú quan trọng</h4>
       <p className="text-on-surface-variant font-body-md italic">
         "Kết quả học tập được cập nhật tự động từ hệ thống. Nếu có sai sót về điểm số hoặc đánh giá, vui lòng liên hệ giáo viên chủ nhiệm trong vòng 03 ngày làm việc kể từ ngày công bố."
       </p>
     </footer>
   </div>
 )
}
