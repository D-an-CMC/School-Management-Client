'use client'

export default function AdministrativeAIPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          TMryl AI CMC
        </h1>
        <p className="text-gray-600">
          Sẵn sàng để dự đoán và tối ưu hóa thông báo
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Chatbot Config */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trợ lý ảo AI Chatbot</h3>
              <p className="text-sm text-gray-600 mt-1">
                Dự nhật phân hội (Temperature)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dự liễu thông báo nổi bộ trưởng
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Chính xác (0.0)</span>
                <span className="font-semibold text-blue-600">0.7</span>
                <span>Sáng tạo (1.0)</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                AI sẽ tiến thông báo nổi phát tính và học sinh
              </p>
            </div>

            <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
              Lưu Cài đặt
            </button>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Phân tích & Dự báo Học thuật</h3>
              <p className="text-sm text-gray-600 mt-1">
                Ngưỡng cảnh báo học lực yếu
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngưỡng cảnh báo: GPA &lt; 5.0
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue="5"
                  min="1"
                  max="10"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg">GPA &lt; 5.0</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">
                Số ngày nghỉ học để đăng ký khi AI phát hiện báo cáo
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  defaultValue="3"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="px-4 py-2 text-gray-600 font-medium">ngày liền tiếp</span>
              </div>
            </div>

            <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
              Dự báo xu hướng
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔔 Bộ lọc & Phân loại Cảnh báo
        </h3>

        <div className="space-y-4">
          {[
            {
              title: 'Nhập điểm cảnh báo cho học sinh trong các tiết học hằng ngày',
              enabled: true,
            },
            {
              title: 'Sửa điểm',
              enabled: true,
            },
            {
              title: 'Phế duyệt điểm',
              enabled: false,
            },
            {
              title: 'Điểm danh Học sinh',
              enabled: true,
            },
            {
              title: 'Chốt số điểm danh',
              enabled: false,
            },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={item.enabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="flex-1 text-gray-700">{item.title}</span>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                item.enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {item.enabled ? 'Hoạt động' : 'Tắt'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            🔒 Lưu cấu hình
          </button>
        </div>
      </div>
    </div>
  )
}
