'use client'

import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { AcademicSelect } from '@/components/academic/academic-select'
import { NotificationBell } from '@/components/notifications/notification-bell'

interface HeaderProps {
  showMenuButton?: boolean
  onMenuClick?: () => void
}

export function Header({ showMenuButton, onMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0">
      {/* Search */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder={showMenuButton ? 'Tìm kiếm...' : 'Tìm kiếm nhật ký...'}
          className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] outline-none"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-6">
        <AcademicSelect compact />
        <NotificationBell />
        <button className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200">
          <div className={cn('text-right', showMenuButton && 'hidden sm:block')}>
            <p className="text-sm font-bold text-gray-900 leading-none">{user?.name || 'Người dùng'}</p>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
              {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role?.toUpperCase() || 'USER'}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-full flex items-center justify-center text-white font-bold text-xs">
            {user?.name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
