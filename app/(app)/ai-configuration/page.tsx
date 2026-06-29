'use client'

export default function AIConfigurationPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, Thầy Hiệu Trưởng - Quản trị viên tối cao
        </h1>
        <p className="text-gray-900 mt-2">
          Hệ thống quản lý học sinh trực tuyến CMC. Dưới đây là báo cáo chuyên sâu hôm nay.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Chatbot Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trợ lý ảo AI Chatbot</h3>
              <p className="text-sm text-gray-900 mt-1">
                Dự nhật phân hội (Temperature)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dự liễu thông báo nổi bộ trưởng
              </label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="70"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-900 mt-2">
                <span>Chính xác (0.0)</span>
                <span className="font-bold text-blue-600">0.7</span>
                <span>Sáng tạo (1.0)</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                AI sẽ tiến thông báo nổi phát tính và học sinh
              </p>
            </div>

            <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
              Lưu Cài đặt
            </button>
          </div>
        </div>

        {/* Performance & Phân tích dự đoán */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Phân tích & Dự báo Học thuật</h3>
              <p className="text-sm text-gray-900 mt-1">
                Ngưỡng cảnh báo học lực yếu
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngưỡng cảnh báo: Điểm &lt; 5.0
              </label>
              <input
                type="number"
                defaultValue="5"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-2">
                Số ngày nghỉ học để đăng ký khi AI phát hiện báo cáo
              </p>
              <input
                type="number"
                defaultValue="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-bold text-white">AI Hệ thống Hoạt động</span>
                <br />
                Độ chính xác hiệu tại
              </p>
            </div>

            <button className="w-full py-2 px-4 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
              Dự báo xu hướng
            </button>
          </div>
        </div>
      </div>

      {/* Alert Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Theo dõi Sức khoẻ & Rủi ro Học thuật
        </h3>

        <p className="text-sm text-gray-900 mb-4">
          Phân tích dữ liệu học tập và hành vi dự đoán Phân tích dự đoán
        </p>

        {/* Chart Placeholder */}
        <div className="bg-gray-50 rounded-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-end gap-2 h-40 justify-center">
            {[45, 52, 38, 65, 42, 58, 72].map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${(value / 72) * 100}%` }}
                />
                <span className="text-xs text-gray-900 mt-2">T{index + 2}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-900 uppercase font-semibold mb-1">Tỷ lệ hoàn thành</div>
            <div className="text-2xl font-bold text-gray-900">94.2%</div>
            <div className="text-xs text-gray-700 mt-1">+2.1% so với tháng trước</div>
          </div>
          <div>
            <div className="text-xs text-gray-900 uppercase font-semibold mb-1">Học lực TỀ toàn trường</div>
            <div className="text-2xl font-bold text-gray-900">7.8</div>
            <div className="text-xs text-gray-700 mt-1">Xếp loại: Khá</div>
          </div>
          <div>
            <div className="text-xs text-gray-900 uppercase font-semibold mb-1">Hệ thống hoạt động</div>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <div className="text-xs text-green-600 mt-1">Hoạt động bình thường</div>
          </div>
          <div>
            <div className="text-xs text-gray-900 uppercase font-semibold mb-1">Dặng ứng lạy</div>
            <div className="text-2xl font-bold text-blue-600">1,242 nodes</div>
            <div className="text-xs text-gray-700 mt-1">Đang xử lý</div>
          </div>
        </div>
      </div>

      {/* High Risk Students */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            ⚠️ Danh sách HỌC SINH BẢO RỦI RO
          </h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">Chi tiết toàn bộ</button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left py-3 font-semibold text-gray-700">HHC SINH</th>
              <th className="text-left py-3 font-semibold text-gray-700">LỚP</th>
              <th className="text-left py-3 font-semibold text-gray-700">MLC ĐỘ RỦI RO</th>
              <th className="text-left py-3 font-semibold text-gray-700">HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Nguyễn Võn Anh', class: '12A1', risk: 'Cao (92%)' },
              { name: 'Trần Thị Bình', class: '11B2', risk: 'Cao (88%)' },
              { name: 'Lê Hoàng Nam', class: '10C4', risk: 'Trung bình (65%)' },
            ].map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">{item.name}</td>
                <td className="py-3">{item.class}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    item.risk.startsWith('Cao')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.risk}
                  </span>
                </td>
                <td className="py-3">
                  <button className="text-gray-600 hover:text-gray-900">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        🔒 Lưu cấu hình
      </button>
    </div>
  )
}
