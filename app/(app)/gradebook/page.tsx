'use client'

export default function GradebookPage() {
  const students = [
    {
      id: 'SV2024-001',
      initials: 'LH',
      name: 'Lê Hải Nam',
      code: 'ID: 20240801',
      mieng: 9.3,
      miengAi: 8.5,
      phut15: 8.0,
      phut15Ai: 8.2,
      dienKn: 7.5,
      dienKnAi: 7.0,
      gimaKn: 8.5,
      gimaKnAi: 8.4,
      cuoiKn: 8.3,
      dtb: 8.3,
    },
    {
      id: 'SV2024-002',
      initials: 'NA',
      name: 'Nguyễn Anh ThW',
      code: 'ID: 20240802',
      mieng: 10,
      miengAi: 9.5,
      phut15: 9.5,
      phut15Ai: 9.8,
      dienKn: 9.0,
      dienKnAi: 9.2,
      gimaKn: 9.5,
      gimaKnAi: 9.6,
      cuoiKn: 9.5,
      dtb: 9.5,
    },
    {
      id: 'SV2024-003',
      initials: 'PM',
      name: 'Phạm Minh Đức',
      code: 'ID: 20240803',
      mieng: 6.5,
      miengAi: 7.0,
      phut15: 7.0,
      phut15Ai: 6.8,
      dienKn: 6.0,
      dienKnAi: 6.3,
      gimaKn: 7.5,
      gimaKnAi: 7.2,
      cuoiKn: 6.9,
      dtb: 6.9,
    },
    {
      id: 'SV2024-004',
      initials: 'TD',
      name: 'Trần DiSu Lịnh',
      code: 'ID: 20240804',
      mieng: 8.5,
      miengAi: 8.0,
      phut15: 9.0,
      phut15Ai: 8.7,
      dienKn: 8.0,
      dienKnAi: 8.2,
      gimaKn: 8.5,
      gimaKnAi: 8.8,
      cuoiKn: 8.5,
      dtb: 8.5,
    },
    {
      id: 'SV2024-005',
      initials: 'QH',
      name: 'Quách Gia Huy',
      code: 'ID: 20240805',
      mieng: 4.0,
      miengAi: 4.3,
      phut15: 5.5,
      phut15Ai: 5.2,
      dienKn: 4.0,
      dienKnAi: 4.0,
      gimaKn: 5.0,
      gimaKnAi: 4.8,
      cuoiKn: 4.8,
      dtb: 4.8,
      lowPerformance: true,
    },
  ]

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Số điểm Học thuật</h1>
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span>🎓</span> Trường THPT Chuyên CMC • Học kỳ II • 2023-2024
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
          📥 Lưu bản nhập
        </button>
        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
          📤 Công bố điểm
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50">
          📄 Xuất báo cáo
        </button>
      </div>

      {/* Class & Subject Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>LỚP HỌC & MÔN HỌC</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Lớp 11B2 - Môn Toán</option>
            </select>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-600">SỐ SỐ</p>
              <p className="text-lg font-bold text-gray-900">42/42 H</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">HOÀN THẦN</p>
              <p className="text-lg font-bold text-gray-900">7.4 DTB</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">DỰ BÁO AI</p>
              <p className="text-lg font-bold text-green-600">85%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-700 uppercase text-xs">HHC SINH & MÃ SỐ</th>
              <th colSpan={2} className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">
                ĐIỂM MIÊNG | AI
              </th>
              <th colSpan={2} className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">
                15 PHÚT | AI
              </th>
              <th colSpan={2} className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">
                ĐKIÊN KN | AI
              </th>
              <th colSpan={2} className="text-center py-3 px-2 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">
                GIMA KN | AI
              </th>
              <th className="text-center py-3 px-4 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">CUỐI KN</th>
              <th className="text-center py-3 px-4 font-bold text-gray-700 uppercase text-xs border-l border-gray-200">ĐTB</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                      {student.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-600">{student.code}</p>
                    </div>
                  </div>
                </td>
                <td className="text-center py-4 px-2">
                  <div className={`font-bold ${student.lowPerformance ? 'text-red-600' : 'text-gray-900'}`}>
                    {student.mieng}
                  </div>
                </td>
                <td className="text-center py-4 px-2 text-red-600 font-semibold">
                  {student.miengAi}
                </td>
                <td className="text-center py-4 px-2">
                  <div className={`font-bold ${student.lowPerformance ? 'text-red-600' : 'text-gray-900'}`}>
                    {student.phut15}
                  </div>
                </td>
                <td className="text-center py-4 px-2 text-red-600 font-semibold">
                  {student.phut15Ai}
                </td>
                <td className="text-center py-4 px-2">
                  <div className={`font-bold ${student.lowPerformance ? 'text-red-600' : 'text-gray-900'}`}>
                    {student.dienKn}
                  </div>
                </td>
                <td className="text-center py-4 px-2 text-red-600 font-semibold">
                  {student.dienKnAi}
                </td>
                <td className="text-center py-4 px-2">
                  <div className={`font-bold ${student.lowPerformance ? 'text-red-600' : 'text-gray-900'}`}>
                    {student.gimaKn}
                  </div>
                </td>
                <td className="text-center py-4 px-2 text-red-600 font-semibold">
                  {student.gimaKnAi}
                </td>
                <td className="text-center py-4 px-4 font-bold text-gray-900 border-l border-gray-200">
                  {student.cuoiKn}
                </td>
                <td className="text-center py-4 px-4 font-bold text-blue-600 border-l border-gray-200">
                  {student.dtb}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-6">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-lg">Phân tích Phó điểm</h3>
          </div>
          <p className="text-sm text-blue-100 mb-4">
            Phó điểm đang tập trung ở mức 7.0 - 8.5. Tỉ lệ học sinh khá giỏi chiếm 68% tổng số.
          </p>
          <a href="#" className="text-blue-200 font-semibold text-sm hover:text-white">Xem chi tiết →</a>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 border border-gray-300">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">📋</span>
            <h3 className="font-bold text-lg text-gray-900">Chủ giải dự liệu</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-600"></span>
              Dữ liệu thực tế (Giáo viên nhập)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Dự báo AI (Dựa trên lịch sử tập)
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-300">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">🤖</span>
            <h3 className="font-bold text-lg text-gray-900">Trợ lý AI CMC</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Phát hiện 3 học sinh có nguy cơ tụt hạng trong kỳ thi cuối kỳ sắp tới.
          </p>
          <a href="#" className="text-blue-600 font-semibold text-sm hover:underline">Xem chi tiết →</a>
        </div>
      </div>
    </div>
  )
}
