'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  getMyNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  type NotificationItem,
} from '@/lib/api'

const POLL_INTERVAL = 30000

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'Vừa xong'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    try {
      const [notif, count] = await Promise.all([
        getMyNotifications({ limit: 20 }),
        getNotificationUnreadCount(),
      ])
      setItems(notif.data ?? [])
      setUnreadCount(count)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    refresh()
    const timer = setInterval(refresh, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [refresh])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function openDropdown() {
    setOpen((prev) => !prev)
    if (!open) {
      setLoading(true)
      await refresh()
      setLoading(false)
    }
  }

  async function handleRead(item: NotificationItem) {
    if (!item.is_read) {
      await markNotificationRead(item.notification_id)
      setItems((prev) =>
        prev.map((n) => (n.notification_id === item.notification_id ? { ...n, is_read: true } : n)),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }
  }

  const adminLink = user?.role === 'admin'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={openDropdown}
        aria-label="Thông báo"
        className="relative text-gray-500 hover:text-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Thông báo</h3>
            {adminLink && (
              <button
                type="button"
                onClick={() => router.push('/admin-notifications')}
                className="text-xs text-[#0066CC] hover:underline font-semibold"
              >
                + Tạo mới
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">Đang tải...</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">Chưa có thông báo nào</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.notification_id}
                  type="button"
                  onClick={() => handleRead(item)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                    !item.is_read && 'bg-blue-50/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm text-gray-900', !item.is_read && 'font-semibold')}>
                      {item.title}
                    </p>
                    {!item.is_read && <span className="mt-1 w-2 h-2 rounded-full bg-[#0066CC] flex-shrink-0" />}
                  </div>
                  {item.content && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.content}</p>}
                  <p className="mt-1 text-[10px] text-gray-400">{timeAgo(item.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
