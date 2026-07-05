'use client'

export default function SecurityLogsPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Info Banner */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 flex items-start gap-2 md:gap-3">
        <span className="text-lg md:text-2xl">✓</span>
        <div>
          <h3 className="font-bold text-sm md:text-base text-gray-900">Nhật ký Bảo mật Hệ thống</h3>
          <p className="text-[10px] md:text-sm text-gray-700 mt-0.5 md:mt-1">
            Xin chào, Thầy Hiệu Trưởng. Giám sát toàn bộ hoạt động hệ thống.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="text-lg md:text-2xl mb-0.5 md:mb-2">📊</div>
          <div className="text-xl md:text-3xl font-bold text-blue-600">12,402</div>
          <div className="text-[10px] md:text-sm text-gray-900">Thành công</div>
          <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 md:mt-2">Truy cập hợp lệ</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="text-lg md:text-2xl mb-0.5 md:mb-2">⚠️</div>
          <div className="text-xl md:text-3xl font-bold text-red-600">243</div>
          <div className="text-[10px] md:text-sm text-gray-900">Thất bại</div>
          <div className="text-[10px] md:text-xs text-red-500 mt-0.5 md:mt-2">Token hết hạn</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="text-lg md:text-2xl mb-0.5 md:mb-2">🔐</div>
          <div className="text-xl md:text-3xl font-bold text-orange-600">98.2%</div>
          <div className="text-[10px] md:text-sm text-gray-900">Thành công</div>
          <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 md:mt-2">Tỷ lệ hoàn thành</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <div className="text-lg md:text-2xl mb-0.5 md:mb-2">🔒</div>
          <div className="text-xl md:text-3xl font-bold text-blue-600">49</div>
          <div className="text-[10px] md:text-sm text-gray-900">Cảnh báo</div>
          <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 md:mt-2">Hôm nay</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 lg:mb-8">
        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Đăng nhập theo giờ</h3>
          <div className="flex items-end gap-1.5 md:gap-2 h-32 md:h-48">
            {[65, 45, 80, 55, 90, 70, 85, 60, 75, 40, 88, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${val}%` }}></div>
                <span className="text-[8px] md:text-[10px] text-gray-500">{i}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-4">Token JWT theo giờ</h3>
          <div className="flex items-end gap-1.5 md:gap-2 h-32 md:h-48">
            {[30, 50, 25, 60, 35, 70, 45, 80, 55, 40, 65, 50].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${val}%` }}></div>
                <span className="text-[8px] md:text-[10px] text-gray-500">{i}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs">THỜI GIAN</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs">TÀI KHOẢN</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden md:table-cell">VAI TRÒ</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden lg:table-cell">IP</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs hidden sm:table-cell">THIẾT BỊ</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs">HÀNH ĐỘNG</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-gray-900 text-[10px] md:text-xs">TT</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '14:32', account: 'admin@cmc.edu.vn', role: 'Admin', ip: '192.168.1.10', device: 'Chrome/Win11', action: 'Đăng nhập', status: 'success' },
                { time: '14:30', account: 'teacher@cmc.edu.vn', role: 'GV', ip: '192.168.1.25', device: 'Safari/iOS', action: 'Cập nhật điểm', status: 'success' },
                { time: '14:28', account: 'unknown', role: '-', ip: '10.0.0.99', device: 'Firefox/Win', action: 'Đăng nhập thất bại', status: 'fail' },
              ].map((log, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 text-[10px] md:text-sm">{log.time}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 font-medium text-gray-900 text-[10px] md:text-sm">{log.account}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 text-[10px] md:text-sm hidden md:table-cell">{log.role}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 text-[10px] md:text-sm hidden lg:table-cell">{log.ip}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 text-[10px] md:text-sm hidden sm:table-cell">{log.device}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-gray-900 text-[10px] md:text-sm">{log.action}</td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <span className={`px-1.5 md:px-2 py-0.5 rounded text-[10px] md:text-xs font-semibold ${
                      log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status === 'success' ? '✓' : '✗'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
