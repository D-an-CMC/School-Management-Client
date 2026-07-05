'use client'

export default function MyClassesPage() {
  const classes = [
    { id: 1, code: 'Lớp 10A1', students: 42, instructor: 'Nguyễn Minh Tâm', gpa: 8.4, aiRisks: 3 },
    { id: 2, code: 'Lớp 11B2', students: 38, instructor: 'Trần Thu Hạ', gpa: 7.9, aiRisks: 0, highlighted: true },
    { id: 3, code: 'Lớp 12A1', students: 45, instructor: 'Lê Vợi Hùng', gpa: 9.1, aiRisks: 1 },
  ]

  const studentDetails = [
    { id: 'SV2024-001', name: 'Trần Hoàng Long', initials: 'TL', email: 'long.th@student.edu.vn', class: 'Khối 11', statusClass: 'ĐANG HHC', statusStyle: 'bg-green-100 text-green-700', performance: 'Xuất sắc', performanceBar: '100%' },
    { id: 'SV2024-042', name: 'Nguyễn Minh Anh', initials: 'MA', email: 'anh.nm@student.edu.vn', class: 'Khối 11', statusClass: 'VÀNG (P)', statusStyle: 'bg-yellow-100 text-yellow-700', performance: 'Có rủi ro', performanceBar: '45%' },
    { id: 'SV2024-015', name: 'Lê Vợi Thành', initials: 'VT', email: 'thanh.lv@student.edu.vn', class: 'Khối 11', statusClass: 'ĐANG HHC', statusStyle: 'bg-green-100 text-green-700', performance: 'Tốt', performanceBar: '85%' },
    { id: 'SV2024-103', name: 'Nguyễn Quỳnh Chi', initials: 'QC', email: 'chi.nq@student.edu.vn', class: 'Lớp trưởng', statusClass: 'ĐANG HHC', statusStyle: 'bg-green-100 text-green-700', performance: 'Xuất sắc', performanceBar: '100%' },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">Danh sách lớp phụ trách</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
          <p className="text-xs md:text-sm text-gray-600">Xem tất cả các lớp quản lý được sắp xếp theo mã lớp</p>
          <a href="#" className="text-blue-600 text-xs md:text-sm font-semibold hover:underline">Xem tất cả →</a>
        </div>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className={`rounded-lg border p-4 md:p-6 transition ${
              classItem.highlighted
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2 md:mb-3">
              <h3 className="text-base md:text-lg font-bold text-gray-900">{classItem.code}</h3>
              <span className="text-lg md:text-2xl font-bold text-blue-600">{classItem.students}</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">Chủ nhiệm: {classItem.instructor}</p>
            <div className="pt-3 md:pt-4 border-t border-gray-200">
              <p className="text-[10px] md:text-xs font-medium text-gray-600 mb-0.5 md:mb-1">HỌC SINH</p>
              <p className="text-base md:text-lg font-bold text-gray-900 mb-0.5 md:mb-1">{classItem.students} Học sinh</p>
              <p className="text-[10px] md:text-xs text-gray-600">ĐIỂM TB: {classItem.gpa}/10</p>
            </div>
            {classItem.aiRisks > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="inline-block bg-red-100 text-red-700 text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded">
                  ⚠ Cảnh báo AI: {classItem.aiRisks} học sinh
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Student Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Chi tiết học sinh - Lớp 11B2</h2>
            <p className="text-[10px] md:text-sm text-gray-600">Cập nhật lúc: 14:30 Hôm nay</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Tìm tên, ID..."
              className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
            />
            <button className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-xs md:text-sm">
              Lọc
            </button>
            <button className="px-3 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-xs md:text-sm">
              Xuất File
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs md:text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">ID CODE</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">HỌC SINH</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs hidden sm:table-cell">LIÊN HỆ</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">PHÂN LOẠI</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs">TRẠNG THÁI</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-bold text-gray-700 uppercase text-[10px] md:text-xs hidden md:table-cell">HIỆU SUẤT</th>
              </tr>
            </thead>
            <tbody>
              {studentDetails.map((student, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 md:py-4 px-2 md:px-4 font-medium text-gray-600 text-xs md:text-sm">{student.id}</td>
                  <td className="py-3 md:py-4 px-2 md:px-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-300 flex items-center justify-center text-[10px] md:text-sm font-bold text-gray-700">
                        {student.initials}
                      </div>
                      <span className="font-medium text-gray-900 text-xs md:text-sm">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-gray-600 text-[10px] md:text-xs hidden sm:table-cell">{student.email}</td>
                  <td className="py-3 md:py-4 px-2 md:px-4 text-gray-900 text-xs md:text-sm">{student.class}</td>
                  <td className="py-3 md:py-4 px-2 md:px-4">
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-semibold ${student.statusStyle}`}>
                      {student.statusClass}
                    </span>
                  </td>
                  <td className="py-3 md:py-4 px-2 md:px-4 hidden md:table-cell">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-14 md:w-20 h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: student.performanceBar }}></div>
                      </div>
                      <span className="text-[10px] md:text-xs font-semibold text-gray-700">{student.performance}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 text-center">Hiển thị 4 trong số 38 học sinh</div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">📊</span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2">Phân tích Phổ điểm</h3>
              <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">
                Phổ điểm đang tập trung ở mức 7.0 - 8.5. Tỉ lệ học sinh khá giỏi chiếm 68%.
              </p>
              <button className="text-blue-600 font-semibold text-xs md:text-sm">Xem chi tiết →</button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-300 p-4 md:p-6">
          <div className="flex items-start gap-2 md:gap-3">
            <span className="text-xl md:text-2xl">📋</span>
            <div>
              <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2">Dự báo điểm</h3>
              <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">
                Dữ liệu thực tế (GV nhập) • Dự báo AI (Lịch sử học tập)
              </p>
              <button className="text-blue-600 font-semibold text-xs md:text-sm">Xem chi tiết →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
