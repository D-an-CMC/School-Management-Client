'use client'

export default function SecurityLogsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-2xl">✓</span>
        <div>
          <h3 className="font-bold text-gray-900">Nhật kỳ Bảo mật Hệ thống</h3>
          <p className="text-sm text-gray-900 mt-1">
            Xin chào, Thầy Hiệu Trưởng - Quản trị viên tối cao. Giám sát toàn diễn các hoạt động hệ thống.
          </p>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-3xl font-bold text-blue-600">12,402</div>
          <div className="text-sm text-gray-900">Thành công</div>
          <div className="text-xs text-gray-700 mt-2">Bạn chủ hộp lệ</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-3xl font-bold text-red-600">243</div>
          <div className="text-sm text-gray-900">Thất bại</div>
          <div className="text-xs text-red-500 mt-2">Token Nổi hôm qua</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl mb-2">🔐</div>
          <div className="text-3xl font-bold text-orange-600">98.2%</div>
          <div className="text-sm text-gray-900">Thành công</div>
          <div className="text-xs text-gray-700 mt-2">Tỷ lệ hoàn thành</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl mb-2">🔒</div>
          <div className="text-3xl font-bold text-blue-600">49</div>
          <div className="text-sm text-gray-900">Cảnh báo ngàn</div>
          <div className="text-xs text-gray-700 mt-2">Cập nhật hôm nay</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Login Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📈 Số lượng đăng nhập theo giờ
          </h3>
          <span className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold mb-4">
            🔵 HÔM NAY
          </span>

          <div className="flex items-end gap-2 h-40">
            {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map((time, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gray-300 rounded-t"
                  style={{ height: `${30 + Math.random() * 70}%` }}
                />
                <span className="text-xs text-gray-900 mt-2 whitespace-nowrap">{time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔐 Xác thực mã Token JWT
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Thành công</span>
              <span className="text-2xl font-bold text-gray-900">12,402</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '98.2%' }}></div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="text-red-700">Yêu cầu không thành công</span>
              <span className="text-2xl font-bold text-gray-900">243</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full" style={{ width: '1.8%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">
            ✓ Nhật kỳ Hoạt động Chỉ tiêu
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Bộ lọc
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">
              ⬇️ Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">THỜI GIAN</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">TÀI KHOẢN</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">VAI TRÒ</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">GIA CHỈ IP</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">THIẾT BỊ</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">HÀNH ĐỘNG</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  time: '2023-11-24\n14:32:01',
                  account: 'thaylieutrương',
                  role: 'Quản trị viên tối cao',
                  ip: '192.168.1.105',
                  device: 'Chrome / Windows',
                  action: 'Thay đổi cầu hình AI (v2.4)',
                  status: 'An toàn',
                },
                {
                  time: '2023-11-24\n14:30:15',
                  account: 'gv_nguyenvan_a',
                  role: 'Giáo viên',
                  ip: '27.67.201.34',
                  device: 'Safari / MacOS',
                  action: 'Sửa điểm số lớp 12A1',
                  status: 'An toàn',
                },
                {
                  time: '2023-11-24\n14:28:44',
                  account: 'unknown_user_x',
                  role: 'Khách',
                  ip: '45.201.12.9',
                  device: 'Unknown / Linux',
                  action: 'Thử nghiệm SQL Injection',
                  status: 'Cảnh báo Rủi ro',
                  isAlert: true,
                },
                {
                  time: '2023-11-24\n14:25:59',
                  account: 'thaylieutrương',
                  role: 'Quản trị viên tối cao',
                  ip: '192.168.1.105',
                  device: 'Chrome / Windows',
                  action: 'Đăng nhập thành công',
                  status: 'An toàn',
                },
              ].map((log, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-900 text-xs whitespace-pre">
                    {log.time}
                  </td>
                  <td className="px-6 py-3 font-mono text-gray-900">{log.account}</td>
                  <td className="px-6 py-3 text-gray-700">{log.role}</td>
                  <td className="px-6 py-3 font-mono text-gray-900">{log.ip}</td>
                  <td className="px-6 py-3 text-gray-900 text-xs">{log.device}</td>
                  <td className="px-6 py-3 text-gray-700">{log.action}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        log.isAlert
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {log.isAlert ? '⚠️' : '✓'} {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-between items-center text-sm text-gray-900">
        <div>Hiển thị 1 - 20 trên tổng số 12,450 bản ghi</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">←</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded font-semibold">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">3</button>
          <button className="px-3 py-1 text-gray-600">...</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">62</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">→</button>
        </div>
      </div>
    </div>
  )
}
