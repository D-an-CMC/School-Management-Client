'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import {
  getCurrentSchoolYear,
  getCurrentSemester,
  getSchoolYears,
  getSemesters,
} from '@/lib/api'

interface AcademicContextValue {
  schoolYears: any[]
  semesters: any[]
  currentSchoolYear: any | null
  currentSemester: any | null
  selectedSemesterId: number | null
  selectedSchoolYearId: number | null
  setSelectedSemesterId: (id: number | null) => void
  setSelectedSchoolYearId: (id: number | null) => void
  reload: () => Promise<void>
}

const AcademicContext = createContext<AcademicContextValue | null>(null)

const SEMESTER_STORAGE_KEY = 'selectedSemesterId'

export function AcademicProvider({ children }: { children: ReactNode }) {
  const [schoolYears, setSchoolYears] = useState<any[]>([])
  const [semesters, setSemesters] = useState<any[]>([])
  const [currentSchoolYear, setCurrentSchoolYear] = useState<any | null>(null)
  const [currentSemester, setCurrentSemester] = useState<any | null>(null)
  const [selectedSemesterId, setSelectedSemesterIdState] = useState<number | null>(null)
  const [selectedSchoolYearId, setSelectedSchoolYearIdState] = useState<number | null>(null)

  const reload = async () => {
    const [yrs, currYear, sems, currSem] = await Promise.all([
      getSchoolYears().catch(() => []),
      getCurrentSchoolYear().catch(() => null),
      getSemesters().catch(() => []),
      getCurrentSemester().catch(() => null),
    ])
    const years = yrs ?? []
    const semesterList = sems ?? []
    setSchoolYears(years)
    setCurrentSchoolYear(currYear)
    setCurrentSemester(currSem)
    setSemesters(semesterList)

    const currentYearId = currYear?.school_year_id ?? null
    // Only semesters that belong to the current school year are valid, so the
    // rest of the app (header, timetables, gradebook) always reflects the active
    // academic year instead of a stale one persisted in localStorage.
    const yearSems = currentYearId != null
      ? semesterList.filter((s: any) => Number(s.school_year_id) === Number(currentYearId))
      : semesterList
    const storagedSem = localStorage.getItem(SEMESTER_STORAGE_KEY)
    const id = storagedSem ? Number(storagedSem) : null
    const validId =
      id && yearSems.some((s: any) => Number(s.semester_id) === id) ? id : null
    const fallback = currSem && yearSems.some((s: any) => Number(s.semester_id) === Number(currSem.semester_id))
      ? currSem
      : (yearSems.find((s: any) => s.is_active) || yearSems[0] || null)
    if (validId) {
      setSelectedSemesterIdState(validId)
    } else if (fallback) {
      setSelectedSemesterIdState(Number(fallback.semester_id))
      localStorage.setItem(SEMESTER_STORAGE_KEY, String(fallback.semester_id))
    } else {
      setSelectedSemesterIdState(null)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSelectedSemesterId = (id: number | null) => {
    setSelectedSemesterIdState(id)
    if (id !== null) {
      localStorage.setItem(SEMESTER_STORAGE_KEY, String(id))
    } else {
      localStorage.removeItem(SEMESTER_STORAGE_KEY)
    }
  }

  const setSelectedSchoolYearId = (id: number | null) => {
    setSelectedSchoolYearIdState(id)
    if (id === null) {
      // No year selected: fall back to the active semester of the current year.
      setSelectedSemesterIdState(null)
      localStorage.removeItem(SEMESTER_STORAGE_KEY)
      return
    }
    getSemesters(id)
      .then((sems) => {
        const list = sems ?? []
        setSemesters(list)
        // Auto-select a default semester for the chosen year so pages have data
        // for that specific year (not a fallback to the current year).
        const stored = localStorage.getItem(SEMESTER_STORAGE_KEY)
        const want = stored ? Number(stored) : null
        if (want && list.some((s: any) => Number(s.semester_id) === want)) {
          setSelectedSemesterIdState(want)
        } else {
          const fallback = list.find((s: any) => s.is_active) || list[0] || null
          setSelectedSemesterIdState(fallback ? Number(fallback.semester_id) : null)
          if (fallback) localStorage.setItem(SEMESTER_STORAGE_KEY, String(fallback.semester_id))
          else localStorage.removeItem(SEMESTER_STORAGE_KEY)
        }
      })
      .catch(() => {})
  }

  const value = useMemo<AcademicContextValue>(
    () => ({
      schoolYears,
      semesters,
      currentSchoolYear,
      currentSemester,
      selectedSemesterId,
      selectedSchoolYearId,
      setSelectedSemesterId,
      setSelectedSchoolYearId,
      reload,
    }),
    [schoolYears, semesters, currentSchoolYear, currentSemester, selectedSemesterId, selectedSchoolYearId]
  )

  return <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
}

export function useAcademic() {
  const ctx = useContext(AcademicContext)
  if (!ctx) throw new Error('useAcademic must be used within AcademicProvider')
  return ctx
}