'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNotification } from '@/lib/api'

type TargetType = 'all' | 'admin' | 'teacher' | 'student' | 'parent' | 'medical' | 'accountant'

const TARGET_OPTIONS: { value: TargetType; label: string; desc: string }[] = [
  { value: 'all', label: 'Tất cả mọi người', desc: 'Mọi vai trò đều nhận được thông báo' },
  { value: 'admin', label: 'Quản trị viên', desc: 'Chỉ các tài khoản quản trị' },
  { value: 'teacher', label: 'Giáo viên', desc: 'Chỉ các tài khoản giáo viên' },
  { value: 'student', label: 'Học sinh', desc: 'Chỉ các tài khoản học sinh' },
  { value: 'parent', label: 'Phụ huynh', desc: 'Chỉ các tài khoản phụ huynh' },
  { value: 'medical', label: 'Y tế', desc: 'Chỉ các tài khoản y tế' },
  { value: 'accountant', label: 'Kế toán', desc: 'Chỉ các tài khoản kế toán' },
]

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập tiêu đề thông báo.' })
      return
    }
    setSending(true)
    setMessage(null)
    try {
      const res = await createNotification({
        title: title.trim(),
        content: content.trim() || undefined,
        targetType,
      })
      if (res.success) {
        setMessage({ type: 'success', text: 'Đã gửi thông báo thành công!' })
        setTitle('')
        setContent('')
      } else {
        setMessage({ type: 'error', text: res.error || 'Gửi thông báo thất bại.' })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Đã xảy ra lỗi.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">Tạo thông báo</h1>
          <p className="text-xs md:text-sm text-gray-600">
            Soạn và gửi thông báo đến giáo viên, học sinh hoặc toàn hệ thống
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2.5 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 transition self-start sm:self-auto"
        >
          ← Quay lại
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-xs md:text-sm font-medium flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold">&times;</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 space-y-5">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thông báo lịch thi học kỳ I"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#003366] outline-none"
            />
          </div>

          {/* Nội dung */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Nhập nội dung chi tiết của thông báo..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#003366] outline-none resize-none"
            />
          </div>

          {/* Đối tượng nhận */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-3">
              Gửi đến
            </label>
            <div className="space-y-2">
              {TARGET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    targetType === opt.value
                      ? 'border-[#0066CC] bg-blue-50/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="targetType"
                    value={opt.value}
                    checked={targetType === opt.value}
                    onChange={() => setTargetType(opt.value)}
                    className="mt-0.5 accent-[#003366]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-[#001d36] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-900 transition disabled:opacity-50"
            >
              {sending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
