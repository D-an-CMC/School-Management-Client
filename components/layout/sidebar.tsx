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
    'bg-gradient-to-b from-[#1E5A8D] to-[#0B3D5C] text-white min-h-screen flex flex-col border-r border-[#054070] overflow-y-auto scroll-smooth',
    isIconOnly && 'w-16',
    isDrawer && 'w-80 shadow-2xl'
  )

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const teacherNavItems = [
    { href: '/dashboard', label: 'Bảng điều khiển', icon: '📊' },
    { href: '/my-classes', label: 'Lớp học của tôi', icon: '👨‍🎓' },
    { href: '/gradebook', label: 'Sổ điểm', icon: '📈' },
    { href: '/attendance', label: 'Điểm danh', icon: '✓' },
    { href: '/administrative-ai', label: 'AI Quản trị', icon: '🤖' },
  ]

  const adminNavItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
    { href: '/user-management', label: 'Quản lý người dùng', icon: '👥' },
    { href: '/system-permissions', label: 'Quyền hệ thống', icon: '🔐' },
    { href: '/ai-configuration', label: 'Cấu hình AI', icon: '⚙️' },
    { href: '/security-logs', label: 'Nhật ký bảo mật', icon: '🔒' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : teacherNavItems

  const handleLinkClick = () => {
    if (isDrawer && onClose) {
      onClose()
    }
  }

  return (
    <aside className={baseClasses}>
      {/* Logo Section */}
      {!isIconOnly && (
        <div className="p-4 border-b border-[#054070] flex-shrink-0 flex justify-center">
          <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center">
            <img
              src="/cmc-secondary-logo.png"
              alt="CMC Secondary School"
              className="h-28 w-auto"
            />
          </Link>
        </div>
      )}
      {isIconOnly && (
        <div className="p-3 border-b border-[#054070] flex-shrink-0 flex justify-center">
          <Link href="/dashboard" className="flex items-center justify-center">
            <span className="text-2xl">🏫</span>
          </Link>
        </div>
      )}

      {/* Close button for drawer */}
      {isDrawer && (
        <div className="p-4 border-b border-[#054070] flex justify-end">
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('overflow-y-auto', isIconOnly ? 'flex-1 px-2 py-4 space-y-1' : 'flex-1 px-4 py-8 space-y-2')}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={handleLinkClick}
            className={cn(
              'flex items-center rounded-lg transition-all text-sm font-medium',
              isIconOnly ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
              isActive(item.href)
                ? 'bg-[#3B82F6] text-white shadow-md'
                : 'text-blue-100 hover:bg-[#2563EB] hover:text-white',
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {!isIconOnly && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Cài đặt & Đăng xuất */}
      <div className={cn('flex-shrink-0', isIconOnly ? 'p-2 space-y-1' : 'border-t border-[#054070] p-4 space-y-2')}>
        <button className={cn('rounded-lg text-blue-100 hover:bg-[#2563EB] hover:text-white transition-all text-sm font-medium', isIconOnly ? 'w-full flex justify-center py-3' : 'w-full flex items-center gap-3 px-4 py-3')}>
          <span className="text-lg">⚙️</span>
          {!isIconOnly && <span>Cài đặt</span>}
        </button>
        <Link
          href="/login"
          onClick={handleLinkClick}
          className={cn('rounded-lg text-blue-100 hover:bg-[#DC2626] hover:text-white transition-all text-sm font-medium', isIconOnly ? 'w-full flex justify-center py-3' : 'w-full flex items-center gap-3 px-4 py-3')}
        >
          <span className="text-lg">🚪</span>
          {!isIconOnly && <span>Đăng xuất</span>}
        </Link>
      </div>
    </aside>
  )
}
