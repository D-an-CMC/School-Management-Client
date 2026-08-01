'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

type SidebarVariant = 'default' | 'icon' | 'drawer'

interface SidebarProps {
  variant?: SidebarVariant
  onClose?: () => void
}

export function Sidebar({ variant = 'default', onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const isIconOnly = variant === 'icon'
  const isDrawer = variant === 'drawer'

  const baseClasses = cn(
    'bg-[#003366] text-white min-h-screen flex flex-col flex-shrink-0 overflow-y-auto scroll-smooth',
    isIconOnly && 'w-16',
    isDrawer && 'w-80 shadow-2xl'
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const adminNavItems = [
    { href: '/dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { href: '/user-management', label: 'User Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { href: '/system-permissions', label: 'System Permissions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
    { href: '/admin-timetable', label: 'Quản lý Thời khóa biểu', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { href: '/class-management', label: 'Quản lý lớp', icon: 'M9.663 17h4.674a1 1 0 00.922-.606l7-15A1 1 0 0021.337 0H2.663a1 1 0 00-.922 1.394l7 15a1 1 0 00.922.606zM12 22v-5' },
    { href: '/grade-management', label: 'Quản lý điểm', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ]

  const teacherNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { href: '/my-classes', label: 'Lớp học phụ trách', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { href: '/gradebook', label: 'Sổ điểm học thuật', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    { href: '/timetable', label: 'Thời khóa biểu', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  const studentNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { href: '/my-classes', label: 'Lớp học của tôi', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { href: '/gradebook', label: 'Kết Quả học tập', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
    { href: '/attendance', label: 'Điểm danh', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { href: '/timetable', label: 'Thời khóa biểu', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ]

  const userRole = (user?.role || '').toLowerCase()
  const navItems = userRole === 'teacher' || userRole === 'giaovien'
    ? teacherNavItems
    : userRole === 'student' || userRole === 'hocsinh-phuhuynh' || userRole === 'hocsinhphuhuynh'
      ? studentNavItems
      : adminNavItems

  const handleLinkClick = () => {
    if (isDrawer && onClose) {
      onClose()
    }
  }

  return (
    <aside className={baseClasses}>
      {!isIconOnly && (
        <div className="p-9 flex flex-col items-center">
          <img
            src="/cmc-secondary-logo.png"
            alt="CMC University Logo"
            className="w-32 h-19 object-contain"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              el.style.display = 'none'
              const fallback = document.createElement('div')
              fallback.className = 'w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003366] text-2xl font-bold mb-4'
              fallback.textContent = 'CMC'
              el.parentNode?.insertBefore(fallback, el)
            }}
          />

          <p className="text-lg font-bold text-center leading-tight">Trường THCS CMC</p>
        </div>
      )}

      {isDrawer && (
        <div className="px-2 py-4 border-t border-[#004080] flex justify-end">
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'flex items-center rounded-md transition-colors text-sm font-medium',
                isIconOnly ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
                active
                  ? 'bg-[#004080] text-white border-l-4 border-blue-400'
                  : 'text-[#A0B4C8] hover:bg-[#004080] hover:text-white'
              )}
            >
              <svg
                className={cn('w-5 h-5', active && 'text-blue-400')}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.icon} />
              </svg>
              {!isIconOnly && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn('border-t border-[#004080]', isIconOnly ? 'p-2 space-y-1' : 'px-2 py-4 space-y-1')}>
        <button className={cn('flex items-center rounded-md text-[#A0B4C8] hover:bg-[#004080] hover:text-white transition-colors text-sm font-medium', isIconOnly ? 'w-full justify-center px-2 py-3' : 'gap-3 px-4 py-3')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!isIconOnly && <span>Cài đặt</span>}
        </button>
        <Link
          href="/login"
          onClick={handleLinkClick}
          className={cn('flex items-center rounded-md text-[#A0B4C8] hover:bg-[#004080] hover:text-white transition-colors text-sm font-medium', isIconOnly ? 'w-full justify-center px-2 py-3' : 'gap-3 px-4 py-3')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!isIconOnly && <span>Đăng xuất</span>}
        </Link>
      </div>
    </aside>
  )
}
