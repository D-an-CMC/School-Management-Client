'use client'

import { useState } from 'react'

export default function AdminAIPage() {
  const aiMessages = [
    {
      id: 1,
      icon: '📦',
      title: 'TMrII AI CMC',
      subtitle: 'Sẵn sàng cho đầy đủ về thông báo',
      time: '',
    },
    {
      id: 2,
      icon: '⚙️',
      title: 'Chào buổi sáng, Thầy Tâm! Hôm nay thầy có 3 tiết dạy tại phòng 402. Thầy có muốn tôi tóm tắt các thông báo mới từ Ban Giám hiệu không?',
      time: '08:15 AM',
    },
    {
      id: 3,
      icon: '👔',
      title: 'Hãy kiểm tra giúp tôi lịch thi học kỳ 1 của lớp 12A1.',
      subtitle: 'Tin nhắn phản hồi AI',
      time: '08:16 AM',
      highlight: true,
    },
    {
      id: 4,
      icon: '⚙️',
      title: 'Lịch thi học kỳ 1 của lớp 12A1 bắt đầu từ ngày 20/12:',
      details: [
        'Toán: 20/12 - 07:30',
        'Vật lý: 21/12 - 09:00',
        'Hóa học: 22/12 - 07:30',
      ],
      buttons: ['Thêm vào lịch', 'Gửi thông báo lớp'],
      time: '08:16 AM',
    },
  ]

  const alerts = [
    {
      title: 'Dự báo Nguy ck Học tập',
      count: 2,
      label1: 'Cao',
      count1: 2,
      label2: 'Trung bình',
      count2: 5,
      color1: 'text-red-600',
      color2: 'text-orange-500',
    },
  ]

  const riskStudents = [
    {
      initials: 'LV',
      name: 'Lê Vợi ViSt',
      class: 'Lớp 12A1',
      attendance: '75%',
      gpa: '4.5 Điểm',
      alert: 'CẢNH BÁO CAO',
      alertColor: 'bg-red-100 text-red-700',
    },
    {
      initials: 'TM',
      name: 'Trần Minh Anh',
      class: 'Lớp 12A1',
      attendance: '88%',
      gpa: '6.2 Điểm',
      alert: 'TRUNG BÌNH',
      alertColor: 'bg-yellow-100 text-yellow-700',
    },
  ]

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - AI Chat */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {aiMessages.map((msg) => (
              <div key={msg.id}>
                {msg.icon && !msg.highlight ? (
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg flex-shrink-0">
                      {msg.icon}
                    </div>
                    <div className="flex-1">
                      {msg.title && (
                        <p className="font-semibold text-gray-900 text-sm">{msg.title}</p>
                      )}
                      {msg.subtitle && (
                        <p className="text-xs text-gray-600 mt-1">{msg.subtitle}</p>
                      )}
                      {msg.details && (
                        <div className="mt-2 space-y-1">
                          {msg.details.map((detail, idx) => (
                            <p key={idx} className="text-sm text-gray-700">
                              {detail}
                            </p>
                          ))}
                        </div>
                      )}
                      {msg.buttons && (
                        <div className="flex gap-2 mt-3">
                          {msg.buttons.map((btn, idx) => (
                            <button
                              key={idx}
                              className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                            >
                              {btn}
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.time && (
                        <p className="text-xs text-gray-600 mt-2">{msg.time}</p>
                      )}
                    </div>
                  </div>
                ) : msg.highlight ? (
                  <div className="bg-blue-900 text-white rounded-lg p-4 mb-4">
                    <p className="text-sm">{msg.title}</p>
                    <p className="text-xs text-blue-200 mt-2">{msg.time}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Nhập yêu cầu tại đây (vd: Tra cứu lịch dạy...)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg">
                ▶
              </button>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">#LichThuc</span>
              <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">#ThongBaoMoi</span>
              <span className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-full">#DiemSo</span>
            </div>
          </div>
        </div>

        {/* Right Column - Alerts & Insights */}
        <div className="space-y-6">
          {/* Risk Forecast */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">!</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Dự báo Nguy ck Học tập</h3>
                <p className="text-xs text-gray-600">DỰ trên dữ liệu chuyên cần và kQ quá bài kiểm tra gần nhất</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-xs text-gray-600">Cao</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">5</div>
                <div className="text-xs text-gray-600">Trung bình</div>
              </div>
            </div>
          </div>

          {/* Risk Students */}
          <div className="space-y-3">
            {riskStudents.map((student, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {student.initials}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{student.name}</h4>
                    <p className="text-xs text-gray-600">{student.class} • Chuyên cần: {student.attendance}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs font-bold text-gray-700">DỰ báo: {student.gpa}</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${student.alertColor}`}>
                        {student.alert}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All */}
          <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold text-sm hover:bg-gray-50">
            Xem tất cả danh sách (24)
          </button>

          {/* Forecast */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Dự báo Kdt quc Học kỳ</h4>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                <span className="text-xs text-gray-700">ThYc tO</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-xs text-gray-700">DỰ báo AI</span>
              </div>
            </div>
            <div className="flex gap-2 text-xs text-gray-600">
              <span>THÁNG 9</span>
              <span>THÁNG 10</span>
              <span>THÁNG 11</span>
              <span>THÁNG 12+</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-lg flex-shrink-0">🤖</span>
              <p className="text-xs text-gray-700">
                "AI dự báo kết quả cuối học kỳ sẽ tăng 15% nếu duy trì ý IS chuyên cần trên 95% trong tháng 12."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
