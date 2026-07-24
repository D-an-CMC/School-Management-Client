# Gradebook Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/gradebook` page — a teacher-facing gradebook with editable score inputs, matching the Vibrant Scholar design system.

**Architecture:** Single file `app/(app)/gradebook/page.tsx`. Reuses existing `Header` component and `Sidebar` via the app layout. Mock student data is a top-level constant in the same file for easy API migration. State managed with `useState` keyed by student ID.

**Tech Stack:** React (Next.js App Router), TypeScript, Tailwind CSS v4, existing design tokens from `app/globals.css`.

## Global Constraints

- Design system: Vibrant Scholar (DESIGN.md in `diem/` folder)
- All colors via CSS variables: `--color-primary`, `--color-secondary-container`, `--color-primary-fixed`, `--color-secondary-fixed`, `--color-border`, etc.
- Typography: Plus Jakarta Sans via `font-headline-xl`, `font-title-md`, `font-label-sm`, `font-body-md`, `font-body-lg`
- Border radius: `rounded-xl` (containers), `rounded-lg` (controls), `rounded-md` (inputs), `rounded-full` (avatars)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Vietnamese UI copy exactly matching the reference HTML

---

## File Structure

| File | Role |
|------|------|
| `app/(app)/gradebook/page.tsx` | **Create** — entire gradebook page (replaces placeholder) |
| `components/layout/header.tsx` | **Reuse** — no changes, already imported by layout |
| `components/layout/sidebar.tsx` | **Reuse** — no changes, `/gradebook` active state already present |

---

### Task 1: Mock Data Structure

**Files:**
- Create: `app/(app)/gradebook/page.tsx`

**Interfaces:**

```typescript
interface Student {
  id: string
  name: string
  studentId: string
  avatarColor: string
  avatarTextColor: string
  initials: string
}

interface ScoreState {
  freq: string[]      // 4 regular assessment scores
  mid: string         // midpoint score
  final: string       // final exam score
}
```

**Step 1: Write the page file with mock data**

Create `app/(app)/gradebook/page.tsx` with the following content:

```tsx
'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

interface Student {
  id: string
  name: string
  studentId: string
  avatarBg: string
  avatarText: string
  initials: string
}

interface ScoreState {
  freq: string[]
  mid: string
  final: string
}

// ──────────────────────────────────────────────────────
// Mock data — replace with API call later
// ──────────────────────────────────────────────────────

const STUDENTS: Student[] = [
  { id: 's1', name: 'Dang Mai', studentId: '6A1-01', avatarBg: 'bg-secondary-fixed', avatarText: 'text-on-secondary-fixed', initials: 'D' },
  { id: 's2', name: 'Do An', studentId: '6A1-04', avatarBg: 'bg-primary-fixed-dim', avatarText: 'text-on-primary-fixed', initials: 'D' },
  { id: 's3', name: 'Do Huy', studentId: '6A1-03', avatarBg: 'bg-tertiary-fixed-dim', avatarText: 'text-on-tertiary-fixed', initials: 'D' },
  { id: 's4', name: 'Huynh Dat', studentId: '6A1-02', avatarBg: 'bg-surface-container-highest', avatarText: 'text-on-surface', initials: 'H' },
]

const INITIAL_SCORES: Record<string, ScoreState> = {
  s1: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s2: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s3: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s4: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
}
```

- [ ] **Step 2: Verify file compiles**
Run: `npx tsc --noEmit --pretty` from project root.
Expected: no errors (only the incomplete file, but types are valid).

- [ ] **Step 3: Commit**
```bash
git add app/(app)/gradebook/page.tsx
git commit -m "feat: gradebook mock data and types

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Page Shell with Header

**Files:**
- Modify: `app/(app)/gradebook/page.tsx`

**Interfaces:**
- Consumes: `Student[]`, `ScoreState` from Task 1

**Step 1: Build the page shell**

Replace the file content with the full implementation below, starting with the imports and ending with the export:

```tsx
'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  name: string
  studentId: string
  avatarBg: string
  avatarText: string
  initials: string
}

interface ScoreState {
  freq: string[]
  mid: string
  final: string
}

const STUDENTS: Student[] = [
  { id: 's1', name: 'Dang Mai', studentId: '6A1-01', avatarBg: 'bg-secondary-fixed', avatarText: 'text-on-secondary-fixed', initials: 'D' },
  { id: 's2', name: 'Do An', studentId: '6A1-04', avatarBg: 'bg-primary-fixed-dim', avatarText: 'text-on-primary-fixed', initials: 'D' },
  { id: 's3', name: 'Do Huy', studentId: '6A1-03', avatarBg: 'bg-tertiary-fixed-dim', avatarText: 'text-on-tertiary-fixed', initials: 'D' },
  { id: 's4', name: 'Huynh Dat', studentId: '6A1-02', avatarBg: 'bg-surface-container-highest', avatarText: 'text-on-surface', initials: 'H' },
]

const INITIAL_SCORES: Record<string, ScoreState> = {
  s1: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s2: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s3: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
  s4: { freq: ['-', '-', '-', '-'], mid: '-', final: '-' },
}

export default function GradebookPage() {
  const [scores, setScores] = useState<Record<string, ScoreState>>(INITIAL_SCORES)
  const [selectedClass, setSelectedClass] = useState('6A1')

  const updateScore = (studentId: string, field: keyof ScoreState, index?: number, value?: string) => {
    setScores(prev => {
      const current = prev[studentId]
      if (!current) return prev

      if (field === 'freq' && typeof index === 'number' && value !== undefined) {
        const newFreq = [...current.freq]
        newFreq[index] = value
        return { ...prev, [studentId]: { ...current, freq: newFreq } }
      }

      if (field === 'mid' && value !== undefined) {
        return { ...prev, [studentId]: { ...current, mid: value } }
      }

      if (field === 'final' && value !== undefined) {
        return { ...prev, [studentId]: { ...current, final: value } }
      }

      return prev
    })
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto bg-surface">
        <div className="p-4 lg:p-lg space-y-md max-w-[1600px] mx-auto">

          {/* ── Page Title Section ── */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-md">
            <div className="space-y-1">
              <h1 className="font-headline-xl text-headline-xl text-on-background">
                Sổ điểm học tập
              </h1>
              <p className="text-on-surface-variant font-body-lg">
                Trường THPT Chuyên CMC • Học kỳ I, 2023 - 2024
              </p>
            </div>
            <div className="flex flex-wrap gap-sm">
              <div className="px-md py-2.5 bg-surface-container-low border border-outline-variant rounded-lg flex items-center gap-2 font-title-md text-on-surface shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="text-sm font-medium">Trạng thái:</span>
                <span className="flex items-center gap-1">
                  <span className="text-tertiary-vibrant">🟡</span>
                  <span>Bản nháp</span>
                </span>
              </div>
              <button className="px-md py-2.5 bg-primary text-on-primary rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-title-md hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">send</span>
                Công bố điểm
              </button>
              <button className="px-md py-2.5 bg-white text-on-surface rounded-lg border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-title-md hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">description</span>
                Xuất báo cáo
              </button>
            </div>
          </div>

          {/* ── Class Selection Bar ── */}
          <div className="bg-white border border-outline-variant rounded-xl p-md flex flex-wrap items-center gap-lg">
            <div className="flex items-center gap-md">
              <span className="font-bold text-on-background">Lớp:</span>
              <div className="relative min-w-[160px]">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white border border-outline-variant rounded-lg py-2 pl-3 pr-10 font-bold appearance-none cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="6A1">6A1</option>
                  <option value="6A2">6A2</option>
                  <option value="7A1">7A1</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
              </div>
            </div>
            <div className="flex items-center gap-xs text-sm">
              <span className="text-on-surface-variant">Lớp: <span className="text-on-background font-bold">{selectedClass}</span></span>
              <span className="mx-2 text-outline-variant">•</span>
              <span className="text-on-surface-variant">Sĩ số: <span className="text-on-background font-bold">{STUDENTS.length}</span></span>
            </div>
          </div>

          {/* ── Gradebook Table ── */}
          <div className="overflow-hidden rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container">
                    <th className="p-md border-2 border-black border-l-0 border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant w-72 text-center">
                      Học sinh
                    </th>
                    <th className="p-md border-2 border-black border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant text-center">
                      Điểm đánh giá thường xuyên
                    </th>
                    <th className="p-md border-2 border-black border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant text-center">
                      Điểm đánh giá giữa kỳ
                    </th>
                    <th className="p-md border-2 border-black border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant text-center">
                      Điểm đánh giá cuối kỳ
                    </th>
                    <th className="p-md border-2 border-black border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant text-center bg-secondary-fixed/10">
                      AI dự đoán điểm thi cuối kỳ
                    </th>
                    <th className="p-md border-2 border-black border-r-0 border-t-0 font-label-sm uppercase tracking-wider text-on-surface-variant text-center bg-primary-container/5">
                      ĐTB
                    </th>
                  </tr>
                </thead>
                <tbody className="border-y-2 border-black">
                  {STUDENTS.map((student) => {
                    const studentScores = scores[student.id]
                    return (
                      <tr key={student.id} className="hover:bg-primary-container/5 transition-colors">
                        {/* Student info */}
                        <td className="p-md border-2 border-black border-l-0">
                          <div className="flex items-center gap-md">
                            <div className={cn('w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm', student.avatarBg, student.avatarText)}>
                              {student.initials}
                            </div>
                            <div>
                              <p className="font-body-lg font-bold text-on-background">{student.name}</p>
                              <p className="text-xs text-outline font-medium">{student.studentId}</p>
                            </div>
                          </div>
                        </td>

                        {/* 4 frequent assessment inputs */}
                        <td className="p-md border-2 border-black text-center">
                          <div className="flex justify-center gap-1">
                            {studentScores.freq.map((val, i) => (
                              <input
                                key={i}
                                type="text"
                                value={val}
                                onChange={(e) => updateScore(student.id, 'freq', i, e.target.value)}
                                className="w-10 h-10 text-center bg-white border-2 border-black rounded-md font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                              />
                            ))}
                          </div>
                        </td>

                        {/* Midpoint score */}
                        <td className="p-md border-2 border-black text-center">
                          <input
                            type="text"
                            value={studentScores.mid}
                            onChange={(e) => updateScore(student.id, 'mid', undefined, e.target.value)}
                            className="w-20 h-12 text-center bg-white border-2 border-black rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </td>

                        {/* Final score */}
                        <td className="p-md border-2 border-black text-center">
                          <input
                            type="text"
                            value={studentScores.final}
                            onChange={(e) => updateScore(student.id, 'final', undefined, e.target.value)}
                            className="w-20 h-12 text-center bg-white border-2 border-black rounded-md font-bold text-lg focus:ring-2 focus:ring-primary focus:outline-none"
                          />
                        </td>

                        {/* AI prediction */}
                        <td className="p-md border-2 border-black text-center bg-secondary-fixed/5">
                          <div className="flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-secondary-vibrant text-sm">psychology</span>
                            <span className="font-bold text-lg text-secondary-vibrant">-</span>
                          </div>
                        </td>

                        {/* Average */}
                        <td className="p-md border-2 border-black border-r-0 text-center bg-primary-container/5 font-extrabold text-primary-vibrant text-xl">
                          -
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Instructions Banner ── */}
          <div className="bg-primary-fixed border-2 border-black p-lg rounded-xl flex items-start gap-md shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-lg flex items-center justify-center text-primary-vibrant shrink-0">
              <span className="material-symbols-outlined text-[32px]">info</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-on-primary-fixed">📋 Hướng dẫn nhập điểm:</h4>
              <p className="text-on-primary-fixed-variant font-medium leading-relaxed">
                Nhập điểm theo loại điểm phía trên. Sau khi nhập xong, nhấn{' '}
                <span className="font-bold italic underline">'Lưu bản nhập'</span> để lưu tạm, rồi{' '}
                <span className="font-bold italic underline">'Công bố điểm'</span> để học sinh có thể xem kết quả ngay trên ứng dụng di động.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verify the page renders**
Start dev server if not running: `npm run dev` (in a separate terminal).
Navigate to `http://localhost:3000/gradebook`.
Expected: page displays with sidebar, header, title, table with 4 student rows, and footer banner. All inputs are editable.

- [ ] **Step 3: Commit**
```bash
git add app/(app)/gradebook/page.tsx
git commit -m "feat: implement gradebook page with editable score table

- Header with draft badge, publish and export buttons
- Class selection dropdown with student count
- Editable score inputs per student (freq/mid/final)
- AI prediction and average columns
- Instructions footer banner

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Visual Verification

**Files:**
- Inspect: `app/(app)/gradebook/page.tsx`

**Step 1: Open browser and navigate**

Navigate to `http://localhost:3000/gradebook`.

**Step 2: Checklist**

- [ ] Sidebar shows "Sổ điểm" item as active (blue highlight `bg-[#3B82F6]`)
- [ ] Header renders with search, notification (🔔), help (❓), and avatar "TMA"
- [ ] Page title "Sổ điểm học tập" uses large headline font
- [ ] "Bản nháp" badge shows with yellow dot
- [ ] "Công bố điểm" button is blue with shadow, hover shifts position
- [ ] "Xuất báo cáo" button is white/outline with shadow
- [ ] Class dropdown shows "6A1" with "Sĩ số: 4"
- [ ] Table header row has gray background (`bg-surface-container`)
- [ ] Table has bold borders (2px black) and shadow offset
- [ ] 4 student rows with avatar circles, names, student IDs
- [ ] Each row has 4 small score inputs in the frequent column
- [ ] Midpoint and final columns have wider editable inputs
- [ ] AI column has purple `psychology` icon with `-`
- [ ] Average column (ĐTB) has blue bold text on tinted background
- [ ] Footer banner has info icon and instruction text
- [ ] Typography matches Plus Jakarta Sans throughout

**Step 3: Fix any visual mismatches**

If anything doesn't match the reference screenshot, adjust Tailwind classes in `page.tsx` and re-check. Do not commit fixes until visual parity is confirmed.

- [ ] **Step 4: Commit** (only if fixes were applied)
```bash
git add app/(app)/gradebook/page.tsx
git commit -m "fix: adjust gradebook visual styling per design review

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

- [ ] **Spec coverage:** Reusable Sidebar — sidebar.tsx already has `/gradebook` active state, no changes needed ✅
- [ ] **Spec coverage:** Page at `app/(app)/gradebook/page.tsx` ✅
- [ ] **Spec coverage:** Header with search, notification, help, avatar ✅
- [ ] **Spec coverage:** Title "Sổ điểm học tập" + school/semester info ✅
- [ ] **Spec coverage:** Draft badge, "Công bố điểm" (primary), "Xuất báo cáo" (outline) ✅
- [ ] **Spec coverage:** Class dropdown + student count ✅
- [ ] **Spec coverage:** Table with student column, 4 freq inputs, midpoint, final, AI prediction, average ✅
- [ ] **Spec coverage:** Footer instructions banner ✅
- [ ] **Spec coverage:** DESIGN.md colors, typography, border-radius applied ✅
- [ ] **Spec coverage:** Mock data separated into STUDENTS array ✅
- [ ] **Spec coverage:** Editable inputs with useState ✅
