'use client'

import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

interface HeaderProps {
  showMenuButton?: boolean
  onMenuClick?: () => void
}

export function Header({ showMenuButton, onMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger button - mobile only */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="text-gray-900 text-2xl leading-none p-1 -ml-1 flex-shrink-0"
            aria-label="Open menu"
          >
            ☰
          </button>
        )}

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder={showMenuButton ? 'Tìm kiếm...' : 'Tìm kiếm học sinh, lớp, giáo viên...'}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Section - User & Notifications */}
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        {/* Notifications */}
        <button className="text-gray-900 hover:text-gray-900 text-xl relative hidden sm:block">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="text-gray-900 hover:text-gray-900 text-xl hidden md:block">❓</button>

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-6 border-l border-gray-200">
          <div className={cn('text-right', showMenuButton && 'hidden')}>
            <div className="font-semibold text-xs md:text-sm text-gray-900">{user?.name || 'Người dùng'}</div>
            <div className="text-[10px] md:text-xs text-gray-700 capitalize">{user?.role || 'khách'}</div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm">
            {user?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
