'use client'

import { useState } from 'react'

export default function AttendancePage() {
  const [currentDate] = useState(new Date(2023, 9, 1))

  const calendarDays = [
    // September days
    { day: 25, month: 'T2' },
    { day: 26, month: 'T3' },
    { day: 27, month: 'T4' },
    { day: 28, month: 'T5' },
    { day: 29, month: 'T6' },
    { day: 30, month: 'T7' },
    // October days
    { day: 1, month: 'T2', status: 'present' },
    { day: 2, month: 'T3', status: 'present' },
    { day: 3, month: 'T4', status: 'present' },
    { day: 4, month: 'T5', status: 'present' },
    { day: 5, month: 'T6', status: 'present' },
    { day: 6, month: 'T7' },
    { day: 7, month: 'CN' },
    { day: 8, month: 'T2', status: 'present' },
    { day: 9, month: 'T3', status: 'present' },
    { day: 10, month: 'T4', status: 'present' },
    { day: 11, month: 'T5', status: 'present' },
    { day: 12, month: 'T6', status: 'present' },
    { day: 13, month: 'T7' },
    { day: 14, month: 'CN' },
    { day: 15, month: 'T2', status: 'present' },
    { day: 16, month: 'T3', status: 'present', current: true },
    { day: 17, month: 'T4', status: 'present' },
    { day: 18, month: 'T5', status: 'present' },
    { day: 19, month: 'T6', status: 'present' },
    { day: 20, month: 'T7' },
    { day: 21, month: 'CN' },
    { day: 22, month: 'T2', status: 'present' },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Calendar */}
        <div className="col-span-2 space-y-6">
          {/* Month Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lịch điểm danh - Tháng 10, 2023</h2>
                <p className="text-sm text-gray-600">Theo dõi chuyên cần hàng ngày của sinh viên</p>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-600 hover:text-gray-900 text-xl">‹</button>
                <button className="text-gray-600 hover:text-gray-900 text-xl">›</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                  <div key={day} className="text-xs font-bold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar dates */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((item, idx) => (
                  <div
                    key={idx}
                    className={`
                      p-3 rounded-lg text-center cursor-pointer transition
                      ${item.current ? 'bg-[#0066CC] text-white font-bold' : 'bg-gray-50 text-gray-900'}
                      ${item.status === 'present' && !item.current ? 'bg-gray-100' : ''}
                    `}
                  >
                    <div className="text-sm font-semibold">{item.day}</div>
                    {item.status === 'present' && (
                      <div className="text-xs mt-1 flex justify-center">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-gray-900">Có mặt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                <span className="text-gray-900">Nghi có phép</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-gray-900">Nghỉ không phép</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Tỷ lệ chuyên cần</div>
              <div className="text-3xl font-bold text-gray-900 mb-3">94.2%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-sm text-gray-600 mb-2">Số ngày vắng</div>
              <div className="text-3xl font-bold text-red-600 mb-1">2 Ngày</div>
              <div className="text-xs text-gray-600">Tên từ đầu học kỳ</div>
            </div>
          </div>

          {/* Grade Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết điểm danh Học kỳ I</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">HÀ HỌC PHÂN</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">TÊN HỌN HỌC</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">TỔNG SỐ TIẾT</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">SỐ TIẾT VẮNG</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: 'KHTN2031', name: 'Khoa học tự nhiên', total: 45, absent: 0, status: 'Đạy đủ 100%' },
                    { code: 'M3042', name: 'Toán', total: 60, absent: 4, status: 'Cảnh báo (93%)' },
                    { code: 'ENG102', name: 'Tiếng anh', total: 30, absent: 2, status: 'An toàn' },
                  ].map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-[#0066CC]">{item.code}</td>
                      <td className="px-6 py-4 text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-900">{item.total}</td>
                      <td className="px-6 py-4 text-gray-900">{item.absent}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${item.absent === 0 ? 'text-green-600' : item.absent <= 2 ? 'text-gray-600' : 'text-red-600'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Absence Request Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <span>📋</span>
              <h3 className="font-semibold text-gray-900">Đơn xin nghỉ học trực tuyến</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Ngày nghỉ</label>
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Loại hình nghỉ</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm">
                  <option>Nghỉ có phép (Bệnh/Việc gia đình)</option>
                  <option>Nghỉ không phép</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Lý do xin nghỉ</label>
                <textarea
                  placeholder="Vui lòng nhập lý do chi tiết..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm h-24 resize-none"
                ></textarea>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                Đơn xin nghỉ học sẽ được gửi tiếp đến phòng Đào tạo và Giáo viên chủ nhiệm. Vui lòng điền đầy đủ thông tin chính xác (giấy tờ khám bệnh - ) nếu nghỉ trên 2 ngày.
              </div>

              <button className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition">
                <span>Gửi yêu cầu</span>
                <span>▶</span>
              </button>

              <button className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition">
                💬
              </button>
            </div>

            {/* Request History */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Lịch sử yêu cầu gần đây</h4>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-green-700">Nghỉ phép ngày 05/10</span>
                    <span className="text-xs text-green-600">ĐÃ DUYỆT</span>
                  </div>
                  <p className="text-xs text-gray-600">Lý do: Khám sức khỏe định kỳ</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-700">Nghỉ phép ngày 22/09</span>
                    <span className="text-xs text-gray-500">HOÃN TẠM</span>
                  </div>
                  <p className="text-xs text-gray-600">Lý do: Việc gia đình</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
