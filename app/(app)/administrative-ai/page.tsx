'use client'

import { useState } from 'react'

export default function AIChatPage() {
  const [messages, setMessages] = useState([
    {
      type: 'user',
      text: 'Chào bạn, tôi muốn kiểm tra kết quả học tập kỳ này của con trai tôi - Nguyễn Văn Nam.',
      time: '10:15 AM',
    },
    {
      type: 'ai',
      text: 'Chào anh! Kết quả học tập của bạn Nguyễn Văn Nam (MSSV: CMC2023001) trong Học kỳ 1 năm 2024 đã được cập nhật:',
      suggestions: [
        'Lập trình hướng đối tượng: A+',
        'Toán rời rạc: B',
        'Kiến trúc máy tính: A',
      ],
      details: 'Anh có cần xem bảng điểm chi tiết hay lịch thi sắp tới của bạn không?',
      time: '10:16 AM',
    },
  ])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0066CC] rounded-full flex items-center justify-center text-3xl">
            👑
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CMC AI Trmlý</h1>
            <p className="text-sm text-gray-600">Xin chào! Tôi là trVIý ảo từ CMC University. Tôi có thể hỏi trực tiếp số liệu, lịch học, và các thủ tục hành chính.</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-2xl ${
                msg.type === 'user'
                  ? 'bg-white border border-gray-300 text-gray-900 rounded-lg shadow-sm p-4'
                  : 'space-y-3'
              }`}
            >
              {msg.type === 'user' ? (
                <div>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-gray-500 mt-2">{msg.time}</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900 mb-3">{msg.text}</p>
                    <div className="space-y-2">
                      {msg.suggestions?.map((suggestion, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-blue-600 font-bold">•</span>
                          <span className="text-gray-900">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                    {msg.details && (
                      <p className="text-sm text-gray-700 mt-3">{msg.details}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 px-2">{msg.time}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-8 py-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Nhập câu hỏi của bạn..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-gray-900"
          />
          <button className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-6 py-3 rounded-lg font-semibold transition">
            Gửi
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition">
            💬
          </button>
        </div>
      </div>
    </div>
  )
}
