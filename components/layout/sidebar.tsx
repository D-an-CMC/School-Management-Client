'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const teacherNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/my-classes', label: 'My Classes', icon: '👨‍🎓' },
    { href: '/gradebook', label: 'Gradebook', icon: '📈' },
    { href: '/attendance', label: 'Attendance', icon: '✓' },
    { href: '/administrative-ai', label: 'Administrative AI', icon: '🤖' },
  ]

  const adminNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
    { href: '/user-management', label: 'Quản lý người dùng', icon: '👥' },
    { href: '/system-permissions', label: 'Quyền hệ thống', icon: '🔐' },
    { href: '/ai-configuration', label: 'Cấu hình AI', icon: '⚙️' },
    { href: '/security-logs', label: 'Nhật ký bảo mật', icon: '🔒' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : teacherNavItems

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1E5A8D] to-[#0B3D5C] text-white min-h-screen flex flex-col border-r border-[#054070] overflow-y-auto scroll-smooth">
      {/* Logo Section */}
      <div className="p-4 border-b border-[#054070] flex-shrink-0">
        <Link href="/" className="flex items-center">
          <img
            src="/cmc-university-logo.png"
            alt="CMC University"
            className="h-16 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium',
              isActive(item.href)
                ? 'bg-[#3B82F6] text-white shadow-md transform scale-105'
                : 'text-blue-100 hover:bg-[#2563EB] hover:text-white',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Cài đặt & Đăng xuất */}
      <div className="border-t border-[#054070] p-4 space-y-2 flex-shrink-0">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-[#2563EB] hover:text-white transition-all text-sm font-medium">
          <span className="text-lg">⚙️</span>
          <span>Cài đặt</span>
        </button>
        <Link
          href="/login"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-[#DC2626] hover:text-white transition-all text-sm font-medium"
        >
          <span className="text-lg">🚪</span>
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
  )
}
