'use client'

export default function AttendancePage() {
  const students = [
    { id: 'SV001', initials: 'TA', name: 'Trần Anh Đức', title: 'Lớp phó Học tập', status: 'present', statusLabel: 'Có mặt', remarks: '' },
    { id: 'SV002', initials: 'LT', name: 'Lê Thị Mai', title: 'Học sinh', status: 'excused', statusLabel: 'Vắng', remarks: 'Phụ huynh xin nghỉ' },
    { id: 'SV003', initials: 'HV', name: 'Hoàng Văn Nam', title: 'Học sinh', status: 'absent', statusLabel: 'Vắng không', remarks: '' },
    { id: 'SV004', initials: 'NQ', name: 'Nguyễn Quỳnh Chi', title: 'Lớp trưởng', status: 'present', statusLabel: 'Có mặt', remarks: '' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-0.5 md:mb-1">Điểm danh</h1>
        <p className="text-xs md:text-sm text-gray-600">Số đầu bài Kỳ thuật số</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-6">
        <button className="px-3 md:px-6 py-1.5 md:py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
          📥 Xuất dữ liệu
        </button>
        <button className="px-3 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1 md:gap-2 text-xs md:text-sm">
          📤 Đồng bộ Phụ huynh
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-6 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">NGÀY HỌC</label>
            <input type="date" defaultValue="2023-11-20" className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs md:text-sm" />
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">TIẾT HỌC</label>
            <select className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs md:text-sm">
              <option>Tiết 2 (07:50)</option>
              <option>Tiết 3 (08:40)</option>
              <option>Tiết 4 (09:30)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-600 mb-1 md:mb-2">LỚP HỌC</label>
            <select className="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs md:text-sm">
              <option>12A1</option>
              <option>11B2</option>
              <option>10A1</option>
            </select>
          </div>
        </div>
        <div className="bg-green-50 border border-green-300 rounded px-3 md:px-4 py-2 text-[10px] md:text-sm text-green-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          Đã kết nối Phụ huynh (Thời gian thực)
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4 md:mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[650px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">MÃ SV</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">HỌC SINH</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">TRẠNG THÁI</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs hidden md:table-cell">GHI CHÚ</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 md:py-4 px-2 md:px-4 font-medium text-gray-600 text-xs md:text-sm">{student.id}</td>
                  <td className="py-3 md:py-4 px-2 md:px-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-[10px] md:text-sm">
                        {student.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs md:text-sm">{student.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-600">{student.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4">
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      <button className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold transition ${
                        student.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                      }`}>Có mặt</button>
                      <button className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold transition ${
                        student.status === 'excused' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                      }`}>Vắng</button>
                      <button className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold transition ${
                        student.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                      }`}>Vắng không</button>
                      <button className="px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200">
                        Nghi phép
                      </button>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 hidden md:table-cell">
                    <input
                      type="text"
                      placeholder="Nhập ghi chú..."
                      className="w-full px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
        <span>Hiển thị 4 / 38 học sinh</span>
        <div className="flex gap-1 md:gap-2">
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">‹</button>
          <span className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded font-bold text-xs md:text-sm">1</span>
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
          <button className="px-2 md:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">›</button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <span className="text-xl md:text-2xl">📋</span>
            <h3 className="text-sm md:text-base font-bold text-gray-900">Nội dung bài học</h3>
          </div>
          <textarea
            placeholder="Nhập nội dung giảng dạy của tiết học này..."
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-xs md:text-sm h-20 md:h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
          ></textarea>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <span className="text-xl md:text-2xl">✓</span>
            <h3 className="text-sm md:text-base font-bold text-gray-900">Nhận xét chung</h3>
          </div>
          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
            <button className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm font-medium text-gray-700 hover:bg-gray-50">Tốt</button>
            <button className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm font-medium text-gray-700 hover:bg-gray-50">Khá</button>
            <button className="px-2 md:px-3 py-1 md:py-2 border border-gray-300 rounded-lg text-[10px] md:text-sm font-medium text-gray-700 hover:bg-gray-50">TB</button>
          </div>
          <textarea
            placeholder="Nhập nhận xét về thái độ học tập..."
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-xs md:text-sm h-14 md:h-16 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-gray-500"
          ></textarea>
        </div>
      </div>
    </div>
  )
}
