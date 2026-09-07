'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createNotification, createActivity } from '@/lib/api'
import { CustomDatePicker } from '@/components/ui/custom-date-picker'

type TargetType = 'all' | 'admin' | 'teacher' | 'student'
type PostType = 'notification' | 'activity'

const TARGET_OPTIONS: { value: TargetType; label: string; desc: string }[] = [
  { value: 'all', label: 'Tất cả mọi người', desc: 'Mọi vai trò đều nhận được thông báo' },
  { value: 'admin', label: 'Quản trị viên', desc: 'Chỉ các tài khoản quản trị' },
  { value: 'teacher', label: 'Giáo viên', desc: 'Chỉ các tài khoản giáo viên' },
  { value: 'student', label: 'Học sinh', desc: 'Chỉ các tài khoản học sinh' },
]

export default function AdminNotificationsPage() {
  const router = useRouter()
  const [postType, setPostType] = useState<PostType>('notification')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [activityDate, setActivityDate] = useState('')
  const [location, setLocation] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setMessage({ type: 'error', text: postType === 'notification' ? 'Vui lòng nhập tiêu đề thông báo.' : 'Vui lòng nhập tên hoạt động.' })
      return
    }
    if (postType === 'activity' && !activityDate) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ngày diễn ra hoạt động.' })
      return
    }
    setSending(true)
    setMessage(null)
    try {
      let res;
      if (postType === 'notification') {
        res = await createNotification({
          title: title.trim(),
          content: content.trim() || undefined,
          targetType,
        })
      } else {
        res = await createActivity({
          activity_name: title.trim(),
          description: content.trim() || undefined,
          start_datetime: activityDate,
          location: location.trim() || undefined,
          activity_type: 'Hoạt động',
        })
      }
      if (res.success) {
        setMessage({ type: 'success', text: postType === 'notification' ? 'Đã gửi thông báo thành công!' : 'Đã tạo hoạt động thành công!' })
        setTitle('')
        setContent('')
        setActivityDate('')
        setLocation('')
      } else {
        setMessage({ type: 'error', text: res.error || 'Thao tác thất bại.' })
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
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">Tạo thông báo / Hoạt động</h1>
          <p className="text-xs md:text-sm text-gray-600">
            Soạn và gửi thông báo hoặc lịch hoạt động đến hệ thống
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
          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setPostType('notification')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${postType === 'notification' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Gửi Thông Báo
            </button>
            <button
              type="button"
              onClick={() => setPostType('activity')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${postType === 'activity' ? 'bg-white shadow text-[#003366]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Gửi Hoạt Động
            </button>
          </div>

          {/* Tiêu đề */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              {postType === 'notification' ? 'Tiêu đề thông báo' : 'Tên hoạt động'} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={postType === 'notification' ? 'VD: Thông báo lịch thi học kỳ I' : 'VD: Lễ mít tinh chào mừng 20/11'}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#003366] outline-none"
            />
          </div>

          {postType === 'activity' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Ngày diễn ra <span className="text-red-500">*</span>
                </label>
                <div className="h-[42px]">
                  <CustomDatePicker
                    value={activityDate}
                    onChange={(val) => setActivityDate(val)}
                    placeholder="dd/mm/yyyy"
                    minYear={2020}
                    maxYear={2035}
                    align="left"
                    className="w-full h-full text-sm rounded-lg border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="VD: Hội trường lớn"
                  className="w-full px-3 h-[42px] border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#003366] outline-none"
                />
              </div>
            </div>
          )}

          {/* Nội dung */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              {postType === 'notification' ? 'Nội dung' : 'Mô tả chi tiết'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder={postType === 'notification' ? 'Nhập nội dung chi tiết của thông báo...' : 'Nhập thông tin chi tiết về hoạt động...'}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#003366] outline-none resize-none"
            />
          </div>

          {/* Đối tượng nhận (chỉ hiện cho Thông báo) */}
          {postType === 'notification' && (
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
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-[#001d36] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-900 transition disabled:opacity-50"
            >
              {sending ? 'Đang xử lý...' : (postType === 'notification' ? 'Gửi thông báo' : 'Tạo hoạt động')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
