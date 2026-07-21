'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TEACHER_MOCK_CLASS, TEACHER_MOCK_STUDENTS, type StudentGradeRow } from './teacher-mock-data'

export function TeacherGradebook() {
 const [students, setStudents] = useState<StudentGradeRow[]>(TEACHER_MOCK_STUDENTS)

 const handleScoreChange = (studentId: string, field: keyof StudentGradeRow['scores'], index: number | undefined, value: string) => {
   setStudents((prev) =>
     prev.map((s) => {
       if (s.id !== studentId) return s
       if (field === 'freq' && typeof index === 'number') {
         const newFreq = [...s.scores.freq]
         newFreq[index] = value
         return { ...s, scores: { ...s.scores, freq: newFreq } }
       }
       return { ...s, scores: { ...s.scores, [field]: value } }
     })
   )
 }

 return (
   <div className="space-y-md">
     {/* Page Heading & Actions */}
     <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-md">
       <div className="space-y-1">
         <h1 className="font-headline-xl text-headline-xl text-on-background font-extrabold uppercase">
           Sổ điểm học tập
         </h1>
         <p className="text-on-surface-variant font-body-lg font-medium">
           {TEACHER_MOCK_CLASS.school} • {TEACHER_MOCK_CLASS.semester}, {TEACHER_MOCK_CLASS.year}
         </p>
       </div>

       <div className="flex flex-wrap gap-sm">
         <div className="px-md py-2.5 bg-white border-2 border-black rounded-lg flex items-center gap-2 font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)]">
           <span className="text-sm font-medium">Trạng thái:</span>
           <span className="flex items-center gap-1">
             <span className="text-tertiary-vibrant">🟡</span>
             <span>Bản nháp</span>
           </span>
         </div>
         <button className="px-md py-2.5 bg-primary text-white border-2 border-black rounded-lg font-title-md shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
           <span className="material-symbols-outlined text-[20px]">send</span>
           Công bố điểm
         </button>
         <button className="px-md py-2.5 bg-white border-2 border-black rounded-lg font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
           <span className="material-symbols-outlined text-[20px]">description</span>
           Xuất báo cáo
         </button>
       </div>
     </div>

     {/* Selection Bar */}
     <div className="bg-white border-2 border-black rounded-xl p-md flex flex-wrap items-center gap-lg">
       <div className="flex items-center gap-md">
         <span className="font-bold text-on-background">Lớp:</span>
         <div className="relative min-w-[160px]">
           <select className="w-full bg-white border-2 border-black rounded-lg py-2 pl-3 pr-10 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none text-on-surface">
             <option>6A1</option>
             <option>6A2</option>
             <option>7A1</option>
           </select>
           <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
             expand_more
           </span>
         </div>
       </div>
       <div className="flex items-center gap-xs">
         <span className="text-on-surface-variant font-medium">
           Lớp: <span className="text-on-background font-bold">{TEACHER_MOCK_CLASS.name}</span>
         </span>
         <span className="mx-2 text-outline">•</span>
         <span className="text-on-surface-variant font-medium">
           Sĩ số:{' '}
           <span className="text-on-background font-bold">{TEACHER_MOCK_CLASS.studentCount}</span>
         </span>
       </div>
     </div>

     {/* Gradebook Table */}
     <div className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
       <div className="overflow-x-auto">
         <table className="w-full border-collapse">
           <thead>
             <tr className="bg-surface-container">
               <th className="p-md border-2 border-black border-l-0 border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-72">
                 Học sinh
               </th>
               <th
                 colSpan={4}
                 className="p-md border-2 border-black border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center"
               >
                 Điểm đánh giá thường xuyên
               </th>
               <th className="p-md border-2 border-black border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-24">
                 Điểm giữa kỳ
               </th>
               <th className="p-md border-2 border-black border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-24">
                 Điểm cuối kỳ
               </th>
               <th className="p-md border-2 border-black border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center bg-secondary-fixed/10 w-32">
                 <span className="flex items-center justify-center gap-1">
                   <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                   AI dự đoán
                 </span>
               </th>
               <th className="p-md border-2 border-black border-r-0 border-t-0 font-label-sm text-label-sm font-bold text-on-surface-variant text-center bg-primary-container/5 w-20">
                 ĐTB
               </th>
             </tr>
           </thead>
           <tbody className="divide-y-2 divide-on-background">
             {students.map((row) => (
               <tr key={row.id} className="hover:bg-primary-container/5 transition-colors">
                 {/* Student Name + Avatar */}
                 <td className="p-md border-2 border-black border-l-0">
                   <div className="flex items-center gap-md">
                     <div
                       className={cn(
                         'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 border-outline-variant',
                         row.avatarBg,
                         row.avatarText
                       )}
                     >
                       {row.avatarLetter}
                     </div>
                     <div>
                       <p className="font-bold text-body-lg text-on-surface">{row.name}</p>
                       <p className="text-xs text-outline font-medium">{row.classCode}</p>
                     </div>
                   </div>
                 </td>

                 {/* 4 Regular Assessment Inputs */}
                 {row.scores.freq.map((val, i) => (
                   <td key={i} className="p-md border-2 border-black text-center">
                     <input
                       type="text"
                       value={val}
                       onChange={(e) => handleScoreChange(row.id, 'freq', i, e.target.value)}
                       className="w-10 h-10 text-center bg-white border-2 border-black rounded-md font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                     />
                   </td>
                 ))}

                 {/* Mid-Term Input */}
                 <td className="p-md border-2 border-black text-center">
                   <input
                     type="text"
                     value={row.scores.midTerm}
                     onChange={(e) => handleScoreChange(row.id, 'midTerm', undefined, e.target.value)}
                     className="w-20 h-12 text-center bg-white border-2 border-black rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                   />
                 </td>

                 {/* Final-Term Input */}
                 <td className="p-md border-2 border-black text-center">
                   <input
                     type="text"
                     value={row.scores.finalTerm}
                     onChange={(e) => handleScoreChange(row.id, 'finalTerm', undefined, e.target.value)}
                     className="w-20 h-12 text-center bg-white border-2 border-black rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                   />
                 </td>

                 {/* AI Prediction */}
                 <td className="p-md border-2 border-black text-center bg-secondary-fixed/5">
                   <div className="flex items-center justify-center gap-1">
                     <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                     <span className="font-bold text-lg text-secondary">{row.aiPrediction}</span>
                   </div>
                 </td>

                 {/* Average */}
                 <td className="p-md border-2 border-black border-r-0 text-center bg-primary-container/5 font-extrabold text-primary text-xl">
                   {row.average}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>

     {/* Instructions Banner */}
     <div className="bg-primary-fixed border-2 border-black p-lg rounded-xl flex items-start gap-md shadow-[2px_2px_0px_rgba(0,0,0,1)]">
       <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center text-primary shrink-0">
         <span className="material-symbols-outlined text-[32px]">info</span>
       </div>
       <div className="space-y-1">
         <h4 className="font-bold text-lg text-on-primary-fixed">📋 Hướng dẫn nhập điểm:</h4>
         <p className="text-on-primary-fixed-variant font-medium leading-relaxed">
           Nhập điểm theo loại điểm phía trên. Sau khi nhập xong, nhấn{' '}
           <span className="font-bold italic underline">'Lưu bản nhập'</span> để lưu tạm, rồi{' '}
           <span className="font-bold italic underline">'Công bố điểm'</span> để học sinh có thể xem kết quả ngay trên
           ứng dụng di động.
         </p>
       </div>
     </div>
   </div>
 )
}
