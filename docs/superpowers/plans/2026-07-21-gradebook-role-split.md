# Gradebook Role-Based Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the `/gradebook` page into role-based views — teachers see an editable gradebook for managing student scores, students see a read-only view of their subject grades.

**Architecture:** Single `/gradebook` route with conditional rendering based on `useAuth().user.role`. Teacher role loads the editable `TeacherGradebook` component; student role renders a read-only subject-grade table. No routing changes or new pages.

**Tech Stack:** React (Next.js App Router), TypeScript, Tailwind CSS v4, existing design tokens from `app/globals.css`.

## Global Constraints

- Design system: Vibrant Scholar (DESIGN.md in `diem/` folder)
- All colors via CSS variables: `--color-primary`, `--color-secondary-container`, etc.
- Typography: Plus Jakarta Sans via `font-headline-xl`, `font-title-md`, `font-label-sm`, `font-body-md`, `font-body-lg`
- Border radius: `rounded-xl` (containers), `rounded-lg` (controls), `rounded-md` (inputs)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Vietnamese UI copy
- Follow existing role-branching pattern from `app/(app)/dashboard/page.tsx` and `app/(app)/my-classes/page.tsx`

---

## File Structure

| File | Role |
|------|------|
| `app/(app)/gradebook/page.tsx` | **Modify** — add role detection, conditional rendering |
| `components/gradebook/TeacherGradebook.tsx` | **Modify** — remove duplicate Sidebar/Header, keep content only |

---

### Task 1: Clean Up TeacherGradebook Component

**Files:**
- Modify: `components/gradebook/TeacherGradebook.tsx`

**Interfaces:**
- Consumes: `TEACHER_MOCK_STUDENTS`, `TEACHER_MOCK_CLASS`, `StudentGradeRow` from `teacher-mock-data.ts`
- Produces: clean content-only component ready for use inside app layout

- [ ] **Step 1: Read the current file to identify what to remove**

Read `components/gradebook/TeacherGradebook.tsx` and note:
- Lines 5-6: `Sidebar` import needs to be removed
- Lines 26-28: `<Sidebar />` JSX needs to be removed
- Lines 33-68: `<header>` block needs to be removed (app layout provides Header)
- Lines 30-32: The `<div className="flex min-h-screen bg-surface">` wrapper and `<main>` tag structure needs adjustment to just return the inner content

- [ ] **Step 2: Update the component to remove duplicate layout**

Replace the file content with:

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TEACHER_MOCK_CLASS, TEACHER_MOCK_STUDENTS, type StudentGradeRow } from './teacher-mock-data'

export function TeacherGradebook() {
 const [students, setStudents] = useState<StudentGradeRow[]>(TEACHER_MOCK_STUDENTS)

 const handleScoreChange = (studentId: string, field: keyof StudentGradeRow['scores'], index?: number, value: string) => {
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
         <h1 className="font-headline-lg text-headline-lg text-on-background font-extrabold uppercase">
           Sổ điểm học tập
         </h1>
         <p className="text-on-surface-variant font-body-lg font-medium">
           {TEACHER_MOCK_CLASS.school} • {TEACHER_MOCK_CLASS.semester}, {TEACHER_MOCK_CLASS.year}
         </p>
       </div>

       <div className="flex flex-wrap gap-sm">
         <div className="px-4 py-2.5 bg-white border border-outline-variant rounded-lg flex items-center gap-2 font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)]">
           <span className="text-sm font-medium">Trạng thái:</span>
           <span className="flex items-center gap-1">
             <span className="text-tertiary-vibrant">🟡</span>
             <span>Bản nháp</span>
           </span>
         </div>
         <button className="px-4 py-2.5 bg-primary text-white border border-primary rounded-lg font-title-md shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
           <span className="material-symbols-outlined text-[20px]">send</span>
           Công bố điểm
         </button>
         <button className="px-4 py-2.5 bg-white border border-outline-variant rounded-lg font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
           <span className="material-symbols-outlined text-[20px]">description</span>
           Xuất báo cáo
         </button>
       </div>
     </div>

     {/* Selection Bar */}
     <div className="bg-white border border-outline-variant rounded-xl p-md flex flex-wrap items-center gap-lg">
       <div className="flex items-center gap-md">
         <span className="font-bold text-on-background">Lớp:</span>
         <div className="relative min-w-[160px]">
           <select className="w-full bg-white border border-outline-variant rounded-lg py-2 pl-3 pr-10 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none text-on-surface">
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
               <th className="p-md border border-l-0 border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-72">
                 Học sinh
               </th>
               <th
                 colSpan={4}
                 className="p-md border border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center"
               >
                 Điểm đánh giá thường xuyên
               </th>
               <th className="p-md border border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-24">
                 Điểm giữa kỳ
               </th>
               <th className="p-md border border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center w-24">
                 Điểm cuối kỳ
               </th>
               <th className="p-md border border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant uppercase tracking-wider text-center bg-secondary-fixed/10 w-32">
                 <span className="flex items-center justify-center gap-1">
                   <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                   AI dự đoán
                 </span>
               </th>
               <th className="p-md border border-r-0 border-t-0 border-black font-label-sm text-label-sm font-bold text-on-surface-variant text-center bg-primary-container/5 w-20">
                 ĐTB
               </th>
             </tr>
           </thead>
           <tbody className="divide-y-2 divide-on-background">
             {students.map((row) => (
               <tr key={row.id} className="hover:bg-primary-container/5 transition-colors">
                 {/* Student Name + Avatar */}
                 <td className="p-md border border-l-0">
                   <div className="flex items-center gap-md">
                     <div
                       className={cn(
                         'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-outline-variant',
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
                   <td key={i} className="p-md border border-black text-center">
                     <input
                       type="text"
                       value={val}
                       onChange={(e) => handleScoreChange(row.id, 'freq', i, e.target.value)}
                       className="w-10 h-10 text-center bg-white border border-outline-variant rounded-md font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                     />
                   </td>
                 ))}

                 {/* Mid-Term Input */}
                 <td className="p-md border border-black text-center">
                   <input
                     type="text"
                     value={row.scores.midTerm}
                     onChange={(e) => handleScoreChange(row.id, 'midTerm', undefined, e.target.value)}
                     className="w-20 h-12 text-center bg-white border border-outline-variant rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                   />
                 </td>

                 {/* Final-Term Input */}
                 <td className="p-md border border-black text-center">
                   <input
                     type="text"
                     value={row.scores.finalTerm}
                     onChange={(e) => handleScoreChange(row.id, 'finalTerm', undefined, e.target.value)}
                     className="w-20 h-12 text-center bg-white border border-outline-variant rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                   />
                 </td>

                 {/* AI Prediction */}
                 <td className="p-md border border-black text-center bg-secondary-fixed/5">
                   <div className="flex items-center justify-center gap-1">
                     <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                     <span className="font-bold text-lg text-secondary">{row.aiPrediction}</span>
                   </div>
                 </td>

                 {/* Average */}
                 <td className="p-md border border-r-0 border-black text-center bg-primary-container/5 font-extrabold text-primary text-xl">
                   {row.average}
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>

     {/* Instructions Banner */}
     <div className="bg-primary-fixed border border-outline-variant p-lg rounded-xl flex items-start gap-md shadow-[2px_2px_0px_rgba(0,0,0,1)]">
       <div className="w-12 h-12 bg-white border border-outline-variant rounded-lg flex items-center justify-center text-primary shrink-0">
         <span className="material-symbols-outlined text-[32px]">info</span>
       </div>
       <div className="space-y-1">
         <h4 className="font-bold text-lg text-on-primary-fixed">Hướng dẫn nhập điểm:</h4>
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty` from project root.
Expected: No errors related to the TeacherGradebook component.

- [ ] **Step 4: Verify the component renders without duplicate header/sidebar**

Start dev server if not running: `npm run dev`
Navigate to any page and confirm no console errors about missing Sidebar/Header imports.
(We can't render TeacherGradebook in isolation yet, but we can verify imports resolve.)

- [ ] **Step 5: Commit**

```bash
git add components/gradebook/TeacherGradebook.tsx
git commit -m "refactor(gradebook): remove duplicate Sidebar/Header from TeacherGradebook

Component now outputs only gradebook content area, ready for use inside
the app layout which already provides Sidebar + Header.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Add Role-Based Rendering to Gradebook Page

**Files:**
- Modify: `app/(app)/gradebook/page.tsx`

**Interfaces:**
- Consumes: `useAuth` hook from `@/lib/auth-context`, `TeacherGradebook` from `@/components/gradebook/TeacherGradebook`
- Produces: page that renders teacher or student view based on role

- [ ] **Step 1: Read current page.tsx to understand the student view**

Read `app/(app)/gradebook/page.tsx` and note the existing student-facing content:
- `SUBJECT_GRADES` mock data (8 subjects)
- Semester/year selectors
- Status badge ("Đã công bố")
- Summary stats (GPA 8.4, highest subject, class ranking)
- Footer notes section

- [ ] **Step 2: Add imports for useAuth and TeacherGradebook**

Add to the top of `app/(app)/gradebook/page.tsx`:

```tsx
import { useAuth } from '@/lib/auth-context'
import { TeacherGradebook } from '@/components/gradebook/TeacherGradebook'
```

- [ ] **Step 3: Add role detection and conditional rendering**

In the `GradebookPage` component, add:

```tsx
const { user } = useAuth()
const isTeacher = user?.role === 'teacher'
```

Then wrap the entire return to conditionally render:

```tsx
return (
  <div className="p-4 lg:p-10 space-y-6 max-w-[1600px] mx-auto">
    {isTeacher ? (
      <TeacherGradebook />
    ) : (
      <>
        {/* Student view — all existing content remains here */}
        {/* Page Title Section */}
        {/* Student Info Section */}
        {/* Grade Table */}
        {/* Summary Analysis Section */}
        {/* Footer / Notes */}
      </>
    )}
  </div>
)
```

- [ ] **Step 4: Write the full updated page.tsx**

Replace the entire file content with:

```tsx
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
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty` from project root.
Expected: No type errors.

- [ ] **Step 6: Verify dev server starts without errors**

Run: `npm run dev` and navigate to `http://localhost:3000/gradebook`.
Expected: Page loads without runtime errors.

- [ ] **Step 7: Test as student**

Log in as a student user and navigate to `/gradebook`.
Expected: Read-only grade table with 8 subjects, summary stats, and footer notes render correctly. No editable inputs, no teacher action buttons.

- [ ] **Step 8: Test as teacher**

Log in as a teacher user and navigate to `/gradebook`.
Expected: Editable gradebook table with student rows, editable score inputs, action buttons (Công bố điểm, Xuất báo cáo), class selector, and instructions banner render correctly. Header and sidebar come from the app layout (not duplicated inside TeacherGradebook).

- [ ] **Step 9: Commit**

```bash
git add app/(app)/gradebook/page.tsx
git commit -m "feat(gradebook): add role-based view switching

Teacher role sees editable TeacherGradebook component.
Student role sees read-only subject-grade table.
Single /gradebook route, no navigation changes.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Visual Verification

**Files:**
- Inspect: `app/(app)/gradebook/page.tsx`, `components/gradebook/TeacherGradebook.tsx`

- [ ] **Step 1: Verify student view matches design**

Navigate to `/gradebook` as a student and check:
- [ ] Page title "Sổ điểm học tập" with large headline font
- [ ] Semester/year dropdown selectors
- [ ] "Đã công bố" green status badge with animated pulse dot
- [ ] Student info card with name, class, year
- [ ] Grade table with 8 subject rows (Math, Literature, English, Physics, Chemistry, Biology, History, Geography)
- [ ] Each row shows: subject badge, 4 freq scores, midterm, final, AI prediction (~), average
- [ ] Summary stats row: GPA (8.4), highest subject (Tiếng Anh 9.6), class ranking (05/45)
- [ ] Footer notes section with dashed border

- [ ] **Step 2: Verify teacher view matches design**

Navigate to `/gradebook` as a teacher and check:
- [ ] Page title "Sổ điểm học tập" with uppercase styling
- [ ] School/semester info line
- [ ] "Bản nháp" yellow status badge
- [ ] "Công bố điểm" (publish) and "Xuất báo cáo" (export) action buttons
- [ ] Class selector dropdown with student count
- [ ] Grade table with student rows (5 students), editable inputs for freq/mid/final
- [ ] AI prediction column with `psychology` icon
- [ ] Average column (ĐTB) with bold styling
- [ ] Instructions banner at bottom
- [ ] Header and sidebar come from app layout (visible once, not duplicated)

- [ ] **Step 3: Fix any visual mismatches**

If anything doesn't match the design, adjust Tailwind classes and re-check. Do not commit fixes until visual parity is confirmed.

- [ ] **Step 4: Commit** (only if fixes were applied)

```bash
git add app/(app)/gradebook/page.tsx components/gradebook/TeacherGradebook.tsx
git commit -m "fix(gradebook): adjust visual styling per design review

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** Single `/gradebook` route with role-based conditional rendering ✅
- [ ] **Spec coverage:** Teacher sees editable TeacherGradebook component ✅
- [ ] **Spec coverage:** Student sees read-only subject-grade table ✅
- [ ] **Spec coverage:** TeacherGradebook cleaned up — no duplicate Sidebar/Header ✅
- [ ] **Spec coverage:** Uses existing `useAuth` role detection pattern ✅
- [ ] **Spec coverage:** No routing changes or new pages ✅
- [ ] **Spec coverage:** Vietnamese UI copy preserved ✅
- [ ] **Spec coverage:** Design system tokens (colors, typography, borders) applied ✅
