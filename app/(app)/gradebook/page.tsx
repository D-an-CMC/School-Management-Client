'use client'

import { mockGrades } from '@/lib/mock-data'

export default function GradebookPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Số điểm Học thuật</h1>
        <p className="text-gray-600">
          📌 Trường THPT Chuyên CMC • Học kỳ II • 2023-2024
        </p>
      </div>

      {/* Filter & Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors">
          📥 Lưu bản nhập
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          ⬆️ Công bố điểm
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          📄 Xuất báo cáo
        </button>
      </div>

      {/* Class Selector */}
      <div className="mb-8 flex items-center gap-4 bg-white border border-gray-200 rounded-lg p-4">
        <label className="font-semibold text-gray-700">LỚP HỌC & MÔN HỌC</label>
        <select className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Lớp 11B2 - Môn Toán</option>
          <option>Lớp 11B2 - Môn Tiếng Anh</option>
          <option>Lớp 11B2 - Môn Vật lý</option>
        </select>
      </div>

      {/* Grade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">42/42</div>
          <div className="text-sm text-gray-700">Số học sinh</div>
          <div className="text-xs text-gray-600 mt-2">100% hoàn tất</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 mb-1">7.4 DTB</div>
          <div className="text-sm text-gray-700">Điểm trung bình lớp</div>
          <div className="text-xs text-gray-600 mt-2">85% hoàn tất</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600 mb-1">🤖</div>
          <div className="text-sm text-gray-700">Dự báo xu hướng</div>
          <div className="text-xs text-gray-600 mt-2">Số ngày nghỉ học để đăng ký khi AI phát hiện báo cáo</div>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">MÃ SV</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">HỌC SINH</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">ĐIỂM MIỄN | AI</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">15 PHÚT | AI</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">ĐÓNG KN | AI</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">GIMA KN | AI</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">CUỐI KN</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">DTB</th>
              </tr>
            </thead>
            <tbody>
              {mockGrades.map((grade, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{grade.studentCode}</td>
                  <td className="px-6 py-4 text-gray-900">{grade.studentName}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 px-3 py-1 rounded">{grade.status15}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {typeof grade.midterm === 'string' ? (
                      <span className="text-red-600 font-semibold">{grade.midterm}</span>
                    ) : (
                      grade.midterm
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{grade.final}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${
                      grade.aiRating === 'Xuất sắc'
                        ? 'bg-green-100 text-green-700'
                        : grade.aiRating === 'Cần cải thiện'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {grade.aiRating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">--</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">{grade.average}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Phân tích Phó điểm</h3>
          <p className="text-sm text-gray-700 mb-4">
            Phó điểm đang tập trung ở mức 7.0 - 8.5. Tầng học sinh khá giỏi chiếm 68% tổng số.
          </p>
          <button className="text-blue-600 font-medium text-sm hover:underline">Xem chi tiết →</button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✓ Chủ giải dự liều</h3>
          <p className="text-sm text-gray-700 mb-4">
            Xác nhận sự có mặt của học sinh trong các tiết học hằng ngày qua thiết bị nhận diện.
          </p>
          <button className="text-green-600 font-medium text-sm hover:underline">Xem chi tiết →</button>
        </div>
      </div>
    </div>
  )
}
