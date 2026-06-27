'use client'

export default function GradebookPage() {
  const subjects = [
    {
      name: 'Toán học',
      teacher: 'Thầy Trần Hoàng Nam',
      overall: 9.2,
      scores: {
        midhang: 9.5,
        phut15: '8.0 / 9.0',
        tiet1: 8.5,
        giuaky: 9.0,
        cuoiky: 9.5,
      },
      aiNote: 'Nhận xét từ AI: "Thực sức bạn có logic của học sinh đang 6 môn của vậng lượn trong chương Hình học không gian. Điểm số đã tăng +0.2 so với tuần trước!"',
    },
    {
      name: 'Ngữ văn',
      teacher: 'Cô Nguyễn Mai Phương',
      overall: 8.4,
      scores: {
        midhang: 10,
        phut15: '7.5',
        tiet1: 8.0,
        giuaky: 8.5,
        cuoiky: 8.2,
      },
      aiNote: 'Nhận xét từ AI: "Cần chú ý trên lộc của học sinh dang 6 môn của vấng lượn trong chương Hình học không gian. AI dự báo nếu giữ nguyên lộc trước chương Hình hoc thinhnên..."',
    },
    {
      name: 'Tiếng Anh',
      teacher: 'Mr. David Smith',
      overall: 7.8,
      scores: {
        midhang: 9.0,
        phut15: '7.0',
        tiet1: 7.5,
        giuaky: 8.0,
        cuoiky: 8.5,
      },
      aiNote: '',
    },
  ]

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tiến độ Bảng điểm Môn học</h1>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">TIẾN độ TỐT</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Minh Anh đang duy trị phong độ xuất sắc trong học kỳ này. Dựa trên dữ liệu số 4 tuần gần nhất, AI ủy báo điểm mạnh +0.2 vào cuối kỳ. Các môn tư nhiên (Toán, Lý) có số bứt phá tỳ lệ.
                </p>
                <div className="flex gap-6 text-sm font-medium">
                  <div>
                    <div className="text-[#0066CC]">Dự báo GPA</div>
                    <div className="text-lg font-bold text-gray-900">8.6</div>
                    <div className="text-xs text-gray-600">↑ +0.2</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tỷ lệ chuyên cần</div>
                    <div className="text-lg font-bold text-gray-900">98%</div>
                    <div className="text-xs text-gray-600">Xuất sắc</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition">
          Xuất PDF
        </button>
      </div>

      {/* Subjects */}
      <div className="space-y-6">
        {subjects.map((subject, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Subject Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-10 h-10 bg-[#0066CC] text-white rounded-full flex items-center justify-center font-bold">
                    {subject.name.charAt(0)}
                  </span>
                  {subject.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">GVBM: {subject.teacher}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{subject.overall}</div>
                <div className="text-sm text-gray-600">TRUNG BÌNH MÔN</div>
              </div>
            </div>

            {/* Scores Grid */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-5 gap-3 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 font-semibold mb-1">MIỄNG</div>
                  <div className="text-2xl font-bold text-gray-900">{subject.scores.midhang}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 font-semibold mb-1">15 PHÚT</div>
                  <div className="text-sm font-bold text-gray-900">{subject.scores.phut15}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 font-semibold mb-1">1 TIẾT</div>
                  <div className="text-2xl font-bold text-gray-900">{subject.scores.tiet1}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 font-semibold mb-1">GIỮA KỲ</div>
                  <div className="text-2xl font-bold text-gray-900">{subject.scores.giuaky}</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-1">TRONG KỲ 2</div>
                  <div className="text-2xl font-bold text-red-600">{subject.scores.cuoiky}</div>
                </div>
              </div>

              {/* AI Note */}
              {subject.aiNote && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phân tích AI:</h4>
                      <p className="text-sm text-gray-700">{subject.aiNote}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">→</span>
            <h3 className="font-semibold text-gray-900">Lên lịch họp phụ huynh</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Đặt lịch trò chuyện với trục trặc chủ nhiệm
          </p>
          <button className="text-[#0066CC] font-semibold text-sm">Đặt lịch →</button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✨</span>
            <h3 className="font-semibold text-gray-900">Xem lộ trình ôn tập AI</h3>
          </div>
          <p className="text-sm text-gray-700 mb-4">
            Lộ trình được cá nhân hóa dựa trên bằng điểm hiện tại
          </p>
          <button className="text-[#0066CC] font-semibold text-sm">Xem →</button>
        </div>
      </div>
    </div>
  )
}
