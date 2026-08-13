'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { askAiChatbot } from '@/lib/api'

interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  timestamp: string
  citations?: any[]
  warnings?: string[]
}

export function ChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const roleName =
    user?.role === 'admin'
      ? 'Quản trị viên (Admin)'
      : user?.role === 'teacher'
      ? 'Giáo viên'
      : 'Học sinh'

  // Welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Xin chào ${user?.name || 'bạn'}! Tôi là Trợ lý AI trường học (RAG Chatbot). Tôi có thể hỗ trợ thông tin tuyển sinh, quy chế, thời khóa biểu và tư vấn theo vai trò **${roleName}** của bạn. Bạn cần hỗ trợ gì hôm nay?`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }
  }, [isOpen, messages.length, roleName, user?.name])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userText = input.trim()
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await askAiChatbot(userText)
      if (res.success && res.data) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.answer,
          citations: res.data.citations,
          warnings: res.data.warnings,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.error || 'Rất tiếc, đã có lỗi kết nối tới AI Service. Vui lòng thử lại sau!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, errMsg])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại dịch vụ!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#003366] hover:bg-[#002244] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border-2 border-white/20"
          title="Mở Trợ lý AI Trường học"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-amber-300 group-hover:rotate-12 transition-transform">
            <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold leading-tight">Trợ lý AI</p>
            <p className="text-[10px] text-blue-200">Hỏi đáp & Trợ giúp</p>
          </div>
          <span className="relative flex h-2.5 w-2.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#003366] text-white px-4 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  Trợ lý AI Trường Học
                  <span className="text-[9px] font-semibold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-300/30">RAG</span>
                </h3>
                <p className="text-[10px] text-blue-200 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Sẵn sàng • Role: {roleName}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#003366] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Citations list if any */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                      <p className="font-bold text-[#003366] mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">menu_book</span>
                        Nguồn tham khảo:
                      </p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        {msg.citations.slice(0, 3).map((c: any, i: number) => (
                          <li key={i} className="truncate">
                            {c.source_file || c.title || 'Tài liệu trường'} {c.page_number ? `(Trang ${c.page_number})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 text-gray-500 p-3 rounded-2xl rounded-bl-none max-w-[80%] text-xs shadow-xs">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#003366] border-t-transparent" />
                <span>Đang suy nghĩ & truy vấn dữ liệu...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-gray-200">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về thời khóa biểu, điểm số, tuyển sinh..."
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366] focus:bg-white transition-all text-gray-900"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-[#003366] hover:bg-[#002244] text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
            <p className="text-[9px] text-gray-400 text-center mt-1.5 font-medium">
              Powered by Langfuse RAG AI • Tích hợp thông minh 3 vai trò
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
