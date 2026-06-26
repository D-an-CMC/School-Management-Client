'use client'

import { mockAttendance } from '@/lib/mock-data'

export default function AttendancePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Số điểu bài & Điểm danh</h1>
      <p className="text-gray-700 mb-8">Số điểu bài Kỳ thuật số</p>

      {/* Date & Class Filter */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-white border border-gray-200 rounded-lg p-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">NGÀY HỌC</label>
          <input
            type="date"
            defaultValue="2023-11-20"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">TIẾT HỌC</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tiết 2 (07:50)</option>
            <option>Tiết 3 (08:50)</option>
            <option>Tiết 4 (09:50)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">LỚP HỌC</label>
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>12A1</option>
            <option>12A2</option>
            <option>11B2</option>
          </select>
        </div>
      </div>

      {/* Status & Action */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex justify-between items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
            ✓ Đã kết nối với Phụ huynh (Thời gian thực)
          </span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            ⬇️ Xuất dữ liệu Số điểu bài
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            🔔 Gửi và Đồng bộ với Phụ huynh
          </button>
        </div>
      </div>

      {/* Điểm danh Records */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">MÃ SV</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">HỌC SINH</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">TRẠNG THÁI ĐIỂM DANH</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-900 text-sm">GHI CHÚ SỐ ĐẦU BÀI / HÀNH VI</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  code: 'SV001',
                  name: 'Trần Anh Đức',
                  role: 'Lớp phó Học tập',
                  status: 'Có mặt',
                  note: 'Nhập nhận xét...',
                },
                {
                  code: 'SV002',
                  name: 'Lê Thị Mai',
                  role: 'Học sinh',
                  status: 'Có mặt',
                  note: 'Phụ huynh xin nghỉ đi khám bệnh',
                },
                {
                  code: 'SV003',
                  name: 'Hoàng Văn Nam',
                  role: 'Học sinh',
                  status: 'Vắng không',
                  note: 'Nhập nhận xét...',
                },
                {
                  code: 'SV004',
                  name: 'Nguyễn Quỳnh Chi',
                  role: 'Lớp trưởng',
                  status: 'Có mặt',
                  note: 'Nhập nhận xét...',
                },
              ].map((student, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-gray-900">{student.code}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-700">{student.role}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'Có mặt'
                          ? 'bg-green-100 text-green-700'
                          : student.status === 'Vắng'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {student.status === 'Có mặt' ? '✓' : student.status === 'Vắng' ? '!' : '✗'}
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="text"
                      placeholder={student.note}
                      className="w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-green-100">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">42/45</div>
          <div className="text-sm text-gray-900">Hiện diễn: 42/45</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-100">
            <span className="text-yellow-600 text-xl">!</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">02</div>
          <div className="text-sm text-gray-900">Có phép: 02</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-red-100">
            <span className="text-red-600 text-xl">✗</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">01</div>
          <div className="text-sm text-gray-900">Không phép: 01</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">📊</div>
          <div className="text-sm text-gray-900">Trang 1 / 4</div>
        </div>
      </div>
    </div>
  )
}
