'use client'

export default function AdminAIPage() {
  const aiMessages = [
    { id: 1, icon: '📦', title: 'TriVIQ AI CMC', subtitle: 'Sẵn sàng hỗ trợ', time: '' },
    { id: 2, icon: '⚙️', title: 'Chào buổi sáng, Thầy Tâm! Hôm nay thầy có 3 tiết dạy tại phòng 402.', time: '08:15 AM' },
    { id: 3, icon: '👔', title: 'Kiểm tra giúp lịch thi học kỳ 1 của lớp 12A1.', subtitle: 'Tin nhắn phản hồi', time: '08:16 AM', highlight: true },
    { id: 4, icon: '⚙️', title: 'Lịch thi học kỳ 1 lớp 12A1:', details: ['Toán: 20/12 - 07:30', 'Vật lý: 21/12 - 09:00', 'Hóa học: 22/12 - 07:30'], buttons: ['Thêm vào lịch', 'Gửi thông báo'], time: '08:16 AM' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">
          Cấu hình AI
        </h1>
        <p className="text-xs md:text-sm text-gray-600">
          Tùy chỉnh hành vi và tham số của AI Chatbot
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 lg:mb-8">
        {/* Chatbot Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-3xl">🤖</span>
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900">Trợ lý ảo AI Chatbot</h3>
              <p className="text-xs md:text-sm text-gray-600">Dự đoán nhiệt độ (Temperature)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Độ chính xác vs Sáng tạo
              </label>
              <input type="range" min="0" max="100" defaultValue="70" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] md:text-xs text-gray-900 mt-1 md:mt-2">
                <span>Chính xác (0.0)</span>
                <span className="font-bold text-blue-600">0.7</span>
                <span>Sáng tạo (1.0)</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <p className="text-[10px] md:text-sm text-gray-700">
                AI sẽ tạo phản hồi cân bằng giữa tính chính xác và sáng tạo.
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3 mb-4">
            <span className="text-2xl md:text-3xl">📊</span>
            <div>
              <h3 className="text-sm md:text-lg font-semibold text-gray-900">Phân tích học đường</h3>
              <p className="text-xs md:text-sm text-gray-600">Cấu hình dự báo học tập</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                Độ nhạy cảnh báo rủi ro
              </label>
              <input type="range" min="0" max="100" defaultValue="60" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] md:text-xs text-gray-900 mt-1 md:mt-2">
                <span>Thấp</span>
                <span className="font-bold text-blue-600">0.6</span>
                <span>Cao</span>
              </div>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg border border-gray-200">
              <p className="text-[10px] md:text-sm text-gray-700">
                Ngưỡng cảnh báo sẽ được kích hoạt khi điểm dự báo giảm quá mức.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart section placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Tiến độ cấu hình</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-gray-900">85%</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Hoàn thành</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-green-600">3</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Model đang chạy</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-blue-600">12</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Prompt templates</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 text-center">
            <div className="text-lg md:text-2xl font-bold text-orange-600">2</div>
            <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">Cảnh báo rủi ro</div>
          </div>
        </div>
      </div>
    </div>
  )
}
