'use client'

export default function MyClassesPage() {
  const classes = [
    {
      id: 1,
      code: 'Lớp 10A1',
      students: 42,
      instructor: 'Nguyễn Minh Tâm',
      gpa: 8.4,
      aiRisks: 3,
    },
    {
      id: 2,
      code: 'Lớp 11B2',
      students: 38,
      instructor: 'Trần Thu Hạ',
      gpa: 7.9,
      aiRisks: 0,
      highlighted: true,
    },
    {
      id: 3,
      code: 'Lớp 12A1',
      students: 45,
      instructor: 'Lê Vợi Hùng',
      gpa: 9.1,
      aiRisks: 1,
    },
  ]

  const studentDetails = [
    {
      id: 'SV2024-001',
      name: 'Trần Hoàng Long',
      initials: 'TL',
      email: 'long.th@student.edu.vn',
      class: 'Khối 11',
      statusClass: 'ĐANG HHC',
      statusStyle: 'bg-green-100 text-green-700',
      performance: 'Excellent',
      performanceBar: '100%',
    },
    {
      id: 'SV2024-042',
      name: 'Nguyễn Minh Anh',
      initials: 'MA',
      email: 'anh.nm@student.edu.vn',
      class: 'Khối 11',
      statusClass: 'VÀNG (P)',
      statusStyle: 'bg-yellow-100 text-yellow-700',
      performance: 'At-Risk',
      performanceBar: '45%',
    },
    {
      id: 'SV2024-015',
      name: 'Lê Vợi Thành',
      initials: 'VT',
      email: 'thanh.lv@student.edu.vn',
      class: 'Khối 11',
      statusClass: 'ĐANG HHC',
      statusStyle: 'bg-green-100 text-green-700',
      performance: 'Good',
      performanceBar: '85%',
    },
    {
      id: 'SV2024-103',
      name: 'Nguyễn Quỳnh Chi',
      initials: 'QC',
      email: 'chi.nq@student.edu.vn',
      class: 'Lớp trưởng',
      statusClass: 'ĐANG HHC',
      statusStyle: 'bg-green-100 text-green-700',
      performance: 'Excellent',
      performanceBar: '100%',
    },
  ]

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Danh sách lớp phụ trách</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">Xem tất cả các lớp quản lý được sắp xếp theo mã lớp & chuyên ngành</p>
          <a href="#" className="text-blue-600 text-sm font-semibold hover:underline">Xem tất cả →</a>
        </div>
      </div>

      {/* Class Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className={`rounded-lg border p-6 transition ${
              classItem.highlighted
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-offset-2'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">{classItem.code}</h3>
              <span className="text-2xl font-bold text-blue-600">{classItem.students}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Chủ nhiệm: {classItem.instructor}</p>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-1">STUDENTS</p>
              <p className="text-lg font-bold text-gray-900 mb-1">{classItem.students} Học sinh</p>
              <p className="text-xs text-gray-500">GPA AVG: {classItem.gpa}/10</p>
            </div>
            {classItem.aiRisks > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded">
                  ⚠ AI Risk Warnings: {classItem.aiRisks} Students
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Student Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Chi tiết học sinh - Lớp 11B2</h2>
            <p className="text-sm text-gray-600">Cập nhật lúc: 14:30 Today</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm tên, ID..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
              Lọc
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm">
              Xuất File
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">ID CODE</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">HỌC SINH</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">LIÊN HỆ</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">PHÂN LOẠI</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">TRẠNG THÁI</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">PERFORMANCE</th>
              </tr>
            </thead>
            <tbody>
              {studentDetails.map((student, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-medium text-gray-600">{student.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                        {student.initials}
                      </div>
                      <span className="font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-xs">{student.email}</td>
                  <td className="py-4 px-4 text-gray-900 text-sm">{student.class}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${student.statusStyle}`}>
                      {student.statusClass}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: student.performanceBar }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{student.performance}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">Hiển thị 10 trong số 38 học sinh</div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Phân tích Phó điểm</h3>
              <p className="text-sm text-gray-700 mb-3">
                Phó điểm đang tập trung ở mức 7.0 - 8.5. Tỉ lệ học sinh khá giỏi chiếm 68% tổng số.
              </p>
              <button className="text-blue-600 font-semibold text-sm">Xem chi tiết →</button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-300 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Chủ giải dự liệu</h3>
              <p className="text-sm text-gray-700 mb-3">
                Dữ liệu thực tế (Giáo viên nhập) • Dự báo AI (Dựa trên lịch sử tập)
              </p>
              <button className="text-blue-600 font-semibold text-sm">Xem chi tiết →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
