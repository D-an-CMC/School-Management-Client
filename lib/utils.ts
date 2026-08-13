import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Các môn đánh giá "Đạt/Chưa đạt" (không có điểm số, không tính vào ĐTB)
export const NON_SCORED_SUBJECT_IDS = new Set<number>([4, 9, 14, 15, 35, 36, 37])

// Các môn có điểm số và được tính vào ĐTB (ngược lại với bộ trên)
export function isScoredSubject(subjectId: number | null | undefined): boolean {
  if (subjectId == null) return true
  return !NON_SCORED_SUBJECT_IDS.has(Number(subjectId))
}

// Môn chung không do giáo viên phụ trách, không nhập điểm: Chào cờ.
export const NON_GRADED_SUBJECT_IDS = new Set<number>([14])

// Loại các môn chung khỏi sổ điểm (nhưng vẫn giữ ở thời khóa biểu).
export function isGradedSubject(subjectId: number | null | undefined): boolean {
  if (subjectId == null) return true
  return !NON_GRADED_SUBJECT_IDS.has(Number(subjectId))
}
