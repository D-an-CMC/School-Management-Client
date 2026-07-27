'use client'

import React, { useState, useRef, useEffect } from 'react'

interface CustomDatePickerProps {
  value?: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  minYear?: number
  maxYear?: number
  className?: string
  hasError?: boolean
  disabled?: boolean
  align?: 'left' | 'right'
}

function getMaxDaysInMonth(month: number, year: number): number {
  if (isNaN(month) || month < 1 || month > 12) return 31
  const y = !isNaN(year) && year > 1000 ? year : 2024
  return new Date(y, month, 0).getDate()
}

export function CustomDatePicker({
  value = '',
  onChange,
  placeholder = 'dd/mm/yyyy',
  minYear = 1940,
  maxYear = 2035,
  className = '',
  hasError = false,
  disabled = false,
  align = 'left',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal text input state formatted as DD/MM/YYYY
  const [inputText, setInputText] = useState('')

  // Parse current prop value to Date
  const parsedDate = value ? new Date(value) : null
  const isValidValue = parsedDate && !isNaN(parsedDate.getTime())

  const [viewYear, setViewYear] = useState<number>(
    isValidValue ? parsedDate.getFullYear() : new Date().getFullYear()
  )
  const [viewMonth, setViewMonth] = useState<number>(
    isValidValue ? parsedDate.getMonth() : new Date().getMonth()
  )

  // Sync inputText when prop value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0')
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const yyyy = d.getFullYear()
        setInputText(`${dd}/${mm}/${yyyy}`)
        setViewYear(yyyy)
        setViewMonth(d.getMonth())
      } else {
        setInputText('')
      }
    } else {
      setInputText('')
    }
  }, [value])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Segment-Locked KeyDown Handler: Prevents Backspace/Delete from destroying slashes or shifting digits into Year!
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const input = e.currentTarget
      const start = input.selectionStart ?? 0
      const end = input.selectionEnd ?? 0

      // If text is present in format DD/MM/YYYY
      const parts = inputText.split('/')
      if (parts.length === 3) {
        let d = parts[0] || '01'
        let m = parts[1] || '01'
        let y = parts[2] || String(new Date().getFullYear())

        // Backspace inside Day segment (indices 0..3)
        if (start <= 3 && end <= 3) {
          e.preventDefault()
          d = '01' // Reset Day to default day 01, leaving month & year untouched!
          const newFormatted = `${d}/${m}/${y}`
          setInputText(newFormatted)
          onChange(`${y}-${m}-${d}`)
          setTimeout(() => input.setSelectionRange(0, 2), 0)
          return
        }

        // Backspace inside Month segment (indices 3..6)
        if (start > 3 && start <= 6 && end <= 6) {
          e.preventDefault()
          m = '01' // Reset Month to default 01, leaving day & year untouched!
          const newFormatted = `${d}/${m}/${y}`
          setInputText(newFormatted)
          onChange(`${y}-${m}-${d}`)
          setTimeout(() => input.setSelectionRange(3, 5), 0)
          return
        }

        // Backspace inside Year segment (indices 6..10)
        if (start > 6) {
          e.preventDefault()
          y = String(new Date().getFullYear())
          const newFormatted = `${d}/${m}/${y}`
          setInputText(newFormatted)
          onChange(`${y}-${m}-${d}`)
          setTimeout(() => input.setSelectionRange(6, 10), 0)
          return
        }
      }
    }
  }

  // Segment-Locked Input Handler (Prevents digit shifting)
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value

    if (!raw.trim()) {
      setInputText('')
      onChange('')
      return
    }

    // Default reference segments from existing inputText
    const currentParts = inputText.split('/')
    const refDay = currentParts[0] || '01'
    const refMonth = currentParts[1] || '01'
    const refYear = currentParts[2] || String(new Date().getFullYear())

    let dayStr = refDay
    let monthStr = refMonth
    let yearStr = refYear

    if (raw.includes('/')) {
      const parts = raw.split('/')

      // Day segment
      if (parts[0] !== undefined && parts[0] !== '') {
        const dDigits = parts[0].replace(/\D/g, '').slice(0, 2)
        dayStr = dDigits || '01'
      }

      // Month segment
      if (parts[1] !== undefined && parts[1] !== '') {
        const mDigits = parts[1].replace(/\D/g, '').slice(0, 2)
        monthStr = mDigits || refMonth
      }

      // Year segment
      if (parts[2] !== undefined && parts[2] !== '') {
        const yDigits = parts[2].replace(/\D/g, '').slice(0, 4)
        yearStr = yDigits || refYear
      }
    } else {
      const digits = raw.replace(/\D/g, '')
      if (digits.length === 8) {
        dayStr = digits.slice(0, 2)
        monthStr = digits.slice(2, 4)
        yearStr = digits.slice(4, 8)
      } else if (digits.length > 0) {
        dayStr = digits.slice(0, 2)
      }
    }

    let dd = parseInt(dayStr, 10)
    let mm = parseInt(monthStr, 10)
    let yyyy = parseInt(yearStr, 10)

    if (isNaN(dd) || dd < 1) dd = 1
    if (isNaN(mm) || mm < 1) mm = 1
    if (mm > 12) mm = 12

    const maxDays = getMaxDaysInMonth(mm, yyyy)
    if (dd > maxDays) dd = 1

    dayStr = String(dd).padStart(2, '0')
    monthStr = String(mm).padStart(2, '0')

    if (isNaN(yyyy) || yyyy < minYear || yyyy > maxYear) {
      yyyy = new Date().getFullYear()
    }
    yearStr = String(yyyy)

    const lockedFormatted = `${dayStr}/${monthStr}/${yearStr}`
    setInputText(lockedFormatted)

    const isoStr = `${yearStr}-${monthStr}-${dayStr}`
    onChange(isoStr)
    setViewYear(yyyy)
    setViewMonth(mm - 1)
  }

  // Handle day click in calendar
  function handleSelectDay(day: number) {
    const selected = new Date(viewYear, viewMonth, day)
    const yyyy = selected.getFullYear()
    const mm = String(selected.getMonth() + 1).padStart(2, '0')
    const dd = String(selected.getDate()).padStart(2, '0')
    const isoStr = `${yyyy}-${mm}-${dd}`

    setInputText(`${dd}/${mm}/${yyyy}`)
    onChange(isoStr)
    setIsOpen(false)
  }

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((prev) => prev - 1)
    } else {
      setViewMonth((prev) => prev - 1)
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((prev) => prev + 1)
    } else {
      setViewMonth((prev) => prev + 1)
    }
  }

  function handleToday() {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    const isoStr = `${yyyy}-${mm}-${dd}`

    setViewYear(yyyy)
    setViewMonth(today.getMonth())
    setInputText(`${dd}/${mm}/${yyyy}`)
    onChange(isoStr)
    setIsOpen(false)
  }

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i)

  const MONTH_NAMES = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  let startDayIdx = firstDayOfMonth.getDay() - 1
  if (startDayIdx === -1) startDayIdx = 6 // Sunday

  const daysArray: (number | null)[] = []
  for (let i = 0; i < startDayIdx; i++) {
    daysArray.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d)
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input wrapper: Segment-Locked KeyDown + Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={10}
          className={`w-full bg-white border ${
            hasError ? 'border-red-400' : 'border-gray-300'
          } rounded-lg pl-3 pr-9 py-2 text-xs text-gray-900 focus:outline-none focus:border-[#001d36] transition-all font-mono ${className}`}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2.5 text-gray-400 hover:text-[#001d36] transition-colors focus:outline-none flex items-center justify-center p-0.5"
          title="Mở lịch chọn ngày"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
        </button>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-bold text-[#001d36] focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs font-bold text-[#001d36] focus:outline-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 text-center mb-1">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w) => (
              <span key={w} className="text-[10px] font-bold text-gray-400 uppercase py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />
              }

              const isSelected =
                isValidValue &&
                parsedDate.getDate() === day &&
                parsedDate.getMonth() === viewMonth &&
                parsedDate.getFullYear() === viewYear

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === viewMonth &&
                new Date().getFullYear() === viewYear

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#001d36] text-white shadow-md font-bold'
                      : isToday
                      ? 'bg-[#001d36]/10 text-[#001d36] border border-[#001d36]/30 font-bold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-bold text-[#001d36] hover:underline"
            >
              Hôm nay
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setInputText('')
                  setIsOpen(false)
                }}
                className="text-[11px] font-bold text-red-500 hover:underline"
              >
                Xóa chọn
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
