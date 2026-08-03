'use client'

import { useState } from 'react'
import { apiFetch } from '@/lib/api'

interface MessageItem {
  id: number
  icon: string
  title: string
  subtitle?: string
  time?: string
  highlight?: boolean
}

export default function AdministrativeAIPage() {
  const [messages, setMessages] = useState<MessageItem[]>([
    { id: 1, icon: '📦', title: 'TriVIQ AI CMC', subtitle: 'Sẵn sàng hỗ trợ đầy đủ', time: '' },
    { id: 2, icon: '⚙️', title: 'Chào bạn! Tôi là AI Trợ lý Quản trị CMC. Bạn có thể hỏi về lịch học, điểm số, rủi ro học tập hoặc danh sách nhân sự.', time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = inputMsg.trim()
    if (!text || sending) return

    const userMsgId = Date.now()
    const userTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, icon: '👔', title: text, subtitle: 'Bạn', time: userTime, highlight: true },
    ])
    setInputMsg('')
    setSending(true)

    try {
      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      const json = await res.json()
      const replyText = json.reply || json.data || 'Tôi đã tiếp nhận yêu cầu của bạn.'
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, icon: '⚙️', title: replyText, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
      ])
    } catch {
      let fallbackReply = 'Tôi là Trợ lý AI CMC. Rất vui được hỗ trợ bạn!'
      const q = text.toLowerCase()
      if (q.includes('lịch') || q.includes('thời khóa biểu')) {
        fallbackReply = 'Dữ liệu thời khóa biểu hiện tại của bạn đã được đồng bộ với hệ thống. Bạn có thể xem chi tiết tại mục Thời khóa biểu.'
      } else if (q.includes('điểm') || q.includes('kết quả')) {
        fallbackReply = 'Hệ thống ghi nhận điểm số của bạn đạt kết quả tốt. Bạn có thể tra cứu Sổ điểm để xem chi tiết từng môn.'
      } else if (q.includes('giáo viên') || q.includes('học sinh') || q.includes('người dùng')) {
        fallbackReply = 'Danh sách người dùng và phân quyền hiện đang được quản lý trực tiếp trong phân hệ Quản lý người dùng.'
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, icon: '⚙️', title: fallbackReply, time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          AI Trợ lý Quản trị
        </h1>
        <p className="text-xs md:text-sm text-gray-600">
          Trò chuyện với AI để hỗ trợ quản lý
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 md:p-6 flex flex-col justify-between min-h-[500px]">
          <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.highlight ? 'bg-[#0B3D5C] text-white' : 'bg-gray-100 text-lg md:text-xl'
                }`}>
                  {msg.icon}
                </div>
                <div className={`flex-1 rounded-lg p-3 md:p-4 ${msg.highlight ? 'bg-[#0B3D5C] text-white' : 'bg-gray-50 border border-gray-200'}`}>
                  {msg.subtitle && (
                    <div className={`text-[10px] md:text-xs font-semibold mb-1 ${msg.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.subtitle}
                    </div>
                  )}
                  <p className={`text-xs md:text-sm leading-relaxed ${msg.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {msg.title}
                  </p>
                  {msg.time && (
                    <div className={`text-[10px] mt-1 md:mt-2 ${msg.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="mt-3 md:mt-4 flex gap-2 md:gap-3">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={sending}
              className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputMsg.trim()}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium text-xs md:text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
              {sending ? 'Đang gửi...' : 'Gửi'}
            </button>
          </form>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Risk Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">Rủi ro học tập</h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-red-600">2</div>
                <div className="text-[10px] md:text-xs text-gray-600">Cao</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-yellow-600">5</div>
                <div className="text-[10px] md:text-xs text-gray-600">Trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold text-green-600">12</div>
                <div className="text-[10px] md:text-xs text-gray-600">Tốt</div>
              </div>
            </div>
          </div>

          {/* Risk Students */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3 md:mb-4">HS có rủi ro</h3>
            <div className="space-y-3 md:space-y-4">
              {[
                { name: 'Nguyễn Văn A', class: '12A1', risk: 'Cao', note: 'Điểm giảm 15%' },
                { name: 'Trần Thị B', class: '11B2', risk: 'Trung bình', note: 'Vắng 3 buổi' },
                { name: 'Lê Văn C', class: '10A1', risk: 'Cao', note: 'Học lực giảm' },
              ].map((s, i) => (
                <div key={i} className="p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs md:text-sm font-semibold text-gray-900">{s.name}</div>
                  <div className="text-[10px] md:text-xs text-gray-600">{s.class} • {s.risk}</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
