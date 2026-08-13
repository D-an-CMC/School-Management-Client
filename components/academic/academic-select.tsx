'use client'

import { useAcademic } from '@/lib/academic-context'

interface AcademicSelectProps {
  compact?: boolean
  showSemester?: boolean
}

export function AcademicSelect({ compact, showSemester = true }: AcademicSelectProps) {
  const {
    semesters,
    currentSchoolYear,
    selectedSchoolYearId,
    selectedSemesterId,
    setSelectedSemesterId,
  } = useAcademic()
  const effectiveYearId = selectedSchoolYearId ?? currentSchoolYear?.school_year_id ?? null
  const yearName = currentSchoolYear?.year_name || '—'
  const yearSems =
    effectiveYearId != null
      ? semesters.filter((s: any) => Number(s.school_year_id) === Number(effectiveYearId))
      : []

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs md:text-sm'} bg-white border border-gray-300 rounded-lg font-semibold text-gray-800 shadow-sm whitespace-nowrap`}
        title="Năm học hiện tại"
      >
        Năm học: {yearName}
      </div>

      {showSemester && (
        <select
          value={selectedSemesterId ?? ''}
          onChange={(e) => {
            const v = e.target.value
            setSelectedSemesterId(v ? Number(v) : null)
          }}
          className={`${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-xs md:text-sm'} bg-white border border-gray-300 rounded-lg font-medium text-gray-800 focus:ring-2 focus:ring-[#003366] outline-none shadow-sm`}
          title="Chọn học kỳ"
        >
          {yearSems.length === 0 ? (
            <option value="">Chưa có học kỳ</option>
          ) : (
            yearSems.map((s: any) => (
              <option key={s.semester_id} value={String(s.semester_id)}>
                {s.is_active ? '(hiện tại) ' : ''}
                {s.semester_name}
              </option>
            ))
          )}
        </select>
      )}
    </div>
  )
}
