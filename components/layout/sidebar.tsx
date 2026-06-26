'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const studentNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
    { href: '/my-classes', label: 'Lớp của tôi', icon: '📚' },
    { href: '/gradebook', label: 'Bảng điểm', icon: '📈' },
    { href: '/attendance', label: 'Điểm danh', icon: '✓' },
    { href: '/administrative-ai', label: 'AI Hành chính', icon: '🤖' },
  ]

  const adminNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
    { href: '/user-management', label: 'Quản lý người dùng', icon: '👥' },
    { href: '/system-permissions', label: 'Quyền hệ thống', icon: '🔐' },
    { href: '/ai-configuration', label: 'Cấu hình AI', icon: '⚙️' },
    { href: '/security-logs', label: 'Nhật ký bảo mật', icon: '🔒' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems

  return (
    <aside className="w-64 bg-[#0B3D5C] text-white min-h-screen flex flex-col border-r border-[#054070]">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#054070]">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-[#0B3D5C] font-bold text-lg">CMC</span>
          </div>
          <div>
            <div className="font-bold text-sm">CMC University</div>
            <div className="text-xs text-gray-300">Trường THPT Chuyên CMC</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
              isActive(item.href)
                ? 'bg-[#0066CC] text-white'
                : 'text-gray-200 hover:bg-[#054070]',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Cài đặt & Đăng xuất */}
      <div className="border-t border-[#054070] p-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-[#054070] transition-colors text-sm font-medium">
          <span className="text-lg">⚙️</span>
          <span>Cài đặt</span>
        </button>
        <Link
          href="/login"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-200 hover:bg-[#054070] transition-colors text-sm font-medium"
        >
          <span className="text-lg">🚪</span>
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
  )
}
