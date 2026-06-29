'use client'

export default function AttendancePage() {
  const students = [
    {
      id: 'SV001',
      initials: 'TA',
      name: 'Trần Anh Đức',
      title: 'Lớp phó Học tập',
      status: 'present',
      statusLabel: 'Có mặt',
      remarks: 'Nhập nhận xét...',
    },
    {
      id: 'SV002',
      initials: 'LT',
      name: 'Lê Thị Mai',
      title: 'Học sinh',
      status: 'excused',
      statusLabel: 'Vắng',
      remarks: 'Phụ huynh xin nghỉ đi khám bệnh',
    },
    {
      id: 'SV003',
      initials: 'HV',
      name: 'Hoàng Văn Nam',
      title: 'Học sinh',
      status: 'absent',
      statusLabel: 'Vắng không',
      remarks: 'Nhập nhận xét...',
    },
    {
      id: 'SV004',
      initials: 'NQ',
      name: 'Nguyễn Quỳnh Chi',
      title: 'Lớp trưởng',
      status: 'present',
      statusLabel: 'Có mặt',
      remarks: 'Nhập nhận xét...',
    },
  ]

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Số đầu bài & Điểm danh</h1>
        <p className="text-sm text-gray-600">Số đầu bài Kỳ thuật số</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-2">
          📥 Xuất dữ liệu Số đầu bài
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2">
          📤 Gửi và Đồng bộ với Phụ huynh
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-end gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-2">NGÀY HỌC</label>
            <input type="date" defaultValue="2023-11-20" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-2">TIẾT HỌC</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>Tiết 2 (07:50)</option>
              <option>Tiết 3 (08:40)</option>
              <option>Tiết 4 (09:30)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-600 mb-2">LỚP HỌC</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>12A1</option>
              <option>11B2</option>
              <option>10A1</option>
            </select>
          </div>
        </div>
        <div className="bg-green-50 border border-green-300 rounded px-4 py-2 text-sm text-green-700 flex items-center gap-2">
          <span>●</span> Đã kết nối với Phụ huynh (Thời gian thực)
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">MÃ SV</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">HỌC SINH</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">TRẠNG THÁI ĐIỂM DANH</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">GHI CHÚ SỐ ĐẦU BÀI / HÀNH VI</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4 font-medium text-gray-600">{student.id}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.title}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${student.status === 'present'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                        }`}
                    >
                      Có mặt
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${student.status === 'excused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                        }`}
                    >
                      Vắng
                    </button>
                    <button
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${student.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                        }`}
                    >
                      Vắng không
                    </button>
                    <button className="px-3 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Nghi phép
                    </button>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <input
                    type="text"
                    placeholder={student.remarks}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-6 px-4">
        <span>Hiển thị 10 trong số 38 học sinh</span>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">‹</button>
          <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded font-bold">1</span>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">›</button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📋</span>
            <h3 className="font-bold text-gray-900">Nội dung bài học</h3>
          </div>
          <textarea
            placeholder="Nhập nội dung giảng dạy của tiết học này..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
          ></textarea>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✓</span>
            <h3 className="font-bold text-gray-900">Nhận xét chung của tiết</h3>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Tốt</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Khá</button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Trung bình</button>
          </div>
          <textarea
            placeholder="Nhập nhận xét về thái độ học tập của cả lớp..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
          ></textarea>
        </div>
      </div>
    </div>
  )
}
