'use client'

import { useAuth } from '@/lib/auth-context'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left Section - Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
          />
        </div>
      </div>

      {/* Right Section - User & Notifications */}
      <div className="flex items-center gap-6 ml-8">
        {/* Notifications */}
        <button className="text-gray-900 hover:text-gray-900 text-xl relative">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="text-gray-900 hover:text-gray-900 text-xl">❓</button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <div className="font-semibold text-sm text-gray-900">{user?.name || 'User'}</div>
            <div className="text-xs text-gray-700 capitalize">{user?.role || 'guest'}</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-full flex items-center justify-center text-white font-bold text-sm">
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
