'use client'

export default function AdministrativeAIPage() {
  const aiMessages = [
    { id: 1, icon: '📦', title: 'TriVIQ AI CMC', subtitle: 'Sẵn sàng hỗ trợ đầy đủ', time: '' },
    { id: 2, icon: '⚙️', title: 'Chào buổi sáng, Thầy Tâm! Hôm nay thầy có 3 tiết dạy tại phòng 402. Thầy có muốn tôi tóm tắt các thông báo mới từ Ban Giám hiệu không?', time: '08:15 AM' },
    { id: 3, icon: '👔', title: 'Hãy kiểm tra giúp tôi lịch thi học kỳ 1 của lớp 12A1.', subtitle: 'Tin nhắn phản hồi', time: '08:16 AM', highlight: true },
    { id: 4, icon: '⚙️', title: 'Lịch thi học kỳ 1 lớp 12A1:', details: ['Toán: 20/12 - 07:30', 'Vật lý: 21/12 - 09:00', 'Hóa học: 22/12 - 07:30'], buttons: ['Thêm vào lịch', 'Gửi thông báo lớp'], time: '08:16 AM' },
  ]

  const alerts = [
    { title: 'Rủi ro học tập', label1: 'Cao', count1: 2, label2: 'Trung bình', count2: 5, color1: 'text-red-600' },
  ]

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
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="space-y-3 md:space-y-4 max-h-[600px] overflow-y-auto">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 md:gap-3 ${msg.highlight ? '' : ''}`}>
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
                  {msg.details && (
                    <ul className={`mt-2 md:mt-3 space-y-1 ${msg.highlight ? 'text-blue-100' : 'text-gray-700'}`}>
                      {msg.details.map((d, i) => (
                        <li key={i} className="text-[10px] md:text-sm flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {msg.buttons && (
                    <div className="flex flex-wrap gap-2 mt-2 md:mt-3">
                      {msg.buttons.map((btn, i) => (
                        <button key={i} className={`px-2 md:px-3 py-1 rounded text-[10px] md:text-xs font-medium transition ${
                          i === 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border border-current hover:bg-white/10'
                        }`}>
                          {btn}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white rounded-lg font-medium text-xs md:text-sm hover:bg-blue-700 transition">
              Gửi
            </button>
          </div>
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
