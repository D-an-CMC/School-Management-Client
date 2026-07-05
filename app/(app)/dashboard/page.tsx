'use client'

import { useAuth } from '@/lib/auth-context'
import { AdminDashboard } from '@/components/dashboard/admin-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboard />
  }

  if (user?.role === 'student') {
    return <StudentDashboard user={user} />
  }

  return <TeacherDashboard user={user} />
}

function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Xin chào, {user?.name} | {user?.role === 'student' ? 'Học sinh' : user?.role}
        </h1>
        <p className="text-sm md:text-base text-gray-900">Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Online Bulletin */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📢</span>
                Bảng tin Trực tuyến
              </h2>
              <a href="#" className="text-xs md:text-sm text-[#0066CC] hover:underline">Xem tất cả</a>
            </div>
            <div className="space-y-3 md:space-y-4">
              {/* Bulletin Item 1 */}
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                <div className="flex gap-2 md:gap-3">
                  <div className="px-2 md:px-3 py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-bold rounded-full h-fit">
                    SỰ KIỆN
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Hội thảo Hướng nghiệp Khối 9</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Kính mời quý phụ huynh tham dự buổi chia sẻ về lộ trình đào...</p>
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-gray-600">
                      <span>📅 24/10/2023</span>
                      <span>🕐 08:30 AM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulletin Item 2 */}
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
                <div className="flex gap-2 md:gap-3">
                  <div className="px-2 md:px-3 py-1 bg-red-100 text-red-700 text-[10px] md:text-xs font-bold rounded-full h-fit">
                    THÔNG BÁO
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Lịch thi Giữa học kỳ I - Năm học 2023-2024</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Thông tin chi tiết về lịch thi, phòng thi và nội dung ôn tập...</p>
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] md:text-xs text-gray-600">
                      <span>📅 22/10/2023</span>
                      <span>📍 Toàn khối</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              Thời khóa biểu hôm nay
            </h2>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
                <div>
                  <div className="font-semibold text-sm md:text-base text-gray-900">Tiết 1-2: Toán học</div>
                  <div className="text-xs md:text-sm text-gray-600">Phòng 402 • T5 Lớp 1</div>
                </div>
                <div className="ml-auto text-xs md:text-sm font-medium text-gray-700">07:30 - 09:10</div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                <div>
                  <div className="font-semibold text-sm md:text-base text-gray-900">Tiết 3: Tiếng Anh</div>
                  <div className="text-xs md:text-sm text-gray-600">Phòng 2 • Thầy Mike</div>
                </div>
                <div className="ml-auto text-xs md:text-sm font-medium text-gray-700">09:30 - 10:15</div>
              </div>
              <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                <div>
                  <div className="font-semibold text-sm md:text-base text-gray-900">Tiết 4-5: Vật lý</div>
                  <div className="text-xs md:text-sm text-gray-600">Phòng 402 • Thầy Dương</div>
                </div>
                <div className="ml-auto text-xs md:text-sm font-medium text-gray-700">10:25 - 12:00</div>
              </div>
            </div>
          </div>

          {/* Teacher Feedback */}
          <div className="bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] rounded-lg border border-[#0066CC] p-4 md:p-6 text-white">
            <div className="flex gap-3 md:gap-4">
              <div className="text-2xl md:text-3xl">⭐</div>
              <div className="flex-1">
                <div className="text-[10px] md:text-sm font-semibold uppercase opacity-90 mb-1 md:mb-2">TIN NHẮN TỪ SỞ GIÁO DỤC</div>
                <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3">Lời khuyên từ Giáo viên</h3>
                <p className="text-xs md:text-sm leading-relaxed mb-3 md:mb-4">
                  "Minh Anh có thái độ học tập tích cực trong tiết Toán hôm nay. Em đã giải được bài toán nâng cao 10 câu!" - Thầy Trần Hoàng Nam - GV Toán
                </p>
                <button className="bg-white text-[#0B3D5C] px-3 md:px-4 py-1.5 md:py-2 rounded font-semibold text-xs md:text-sm hover:bg-gray-100 transition">
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 md:space-y-6 mt-4 lg:mt-0">
          {/* Attendance */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 flex items-center gap-2">
                <span>🛡️</span>
                Trạng thái Điểm danh
              </h3>
            </div>
            <div className="flex flex-col items-center gap-4 md:gap-6">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="93.92 100.53" strokeDashoffset="0" strokeLinecap="round" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="6.69 100.53" strokeDashoffset="-93.92" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">93%</div>
                    <div className="text-[10px] md:text-sm text-gray-600">Có mặt</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-600 shadow-sm"></span>
                    <span className="text-xs md:text-sm text-gray-900 font-medium">Có mặt</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-900 font-medium">42 học sinh</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-600 shadow-sm"></span>
                    <span className="text-xs md:text-sm text-gray-900 font-medium">Vắng</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-900 font-medium">3 học sinh</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gray-500 shadow-sm"></span>
                    <span className="text-xs md:text-sm text-gray-900 font-medium">Tổng</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-900 font-medium">45 học sinh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discipline */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 flex items-center gap-2">
                <span>🛡️</span>
                Chuyên cần tuần này
              </h3>
              <span className="px-2 py-0.5 md:py-1 bg-green-100 text-green-700 text-[10px] md:text-xs font-bold rounded">TỐT</span>
            </div>
            <div className="text-center py-4 md:py-6">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full border-4 md:border-8 border-gray-200 flex items-center justify-center bg-gray-50">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">98%</div>
                  <div className="text-[10px] md:text-xs text-gray-600">Tỷ lệ</div>
                </div>
              </div>
              <div className="mt-3 md:mt-4 flex justify-center gap-1.5 md:gap-2">
                {['T2', 'T3', 'T4', 'T5', 'T6'].map((day) => (
                  <div key={day} className="text-center">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded flex items-center justify-center text-[10px] md:text-xs font-bold text-green-700">✓</div>
                    <div className="text-[10px] text-gray-600 mt-0.5 md:mt-1">{day}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] md:text-xs text-gray-600 mt-2 md:mt-3">Minh Anh chỉ vắng 1 tiết có phép do khám sức khỏe.</p>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-4 flex items-center gap-2">
              <span>📈</span>
              Tiến độ học tập
            </h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-900">Toán học</span>
                  <span className="text-xs md:text-sm font-bold text-gray-900">9.2</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                  <div className="bg-[#0066CC] h-1.5 md:h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-900">Tiếng Anh</span>
                  <span className="text-xs md:text-sm font-bold text-gray-900">8.8</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                  <div className="bg-[#0066CC] h-1.5 md:h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-900">Vật lý</span>
                  <span className="text-xs md:text-sm font-bold text-gray-900">8.5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                  <div className="bg-[#0066CC] h-1.5 md:h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-3 md:mt-4 text-[#0066CC] text-xs md:text-sm font-semibold hover:underline">
              XEM BẢNG ĐIỂM CHI TIẾT
            </button>
          </div>

          {/* AI Chat Widget */}
          <div className="bg-gray-900 text-white rounded-lg p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[#0066CC] rounded-full flex items-center justify-center text-sm md:text-base">👑</div>
              <div>
                <div className="font-bold text-sm md:text-base text-gray-900">TriVIQ CMC AI</div>
                <div className="text-[10px] md:text-xs text-gray-400">Sản phẩm hỗ trợ bạn</div>
              </div>
            </div>
            <p className="text-xs md:text-sm mb-3 md:mb-4 leading-relaxed text-gray-100">
              &ldquo;Hôm nay Minh Anh có bài kiểm tra 15 phút môn Hóa. Bạn có muốn tôi giúp bạn ôn tập không?&rdquo;
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-gray-900 px-2 md:px-3 py-1.5 md:py-2 rounded font-medium text-xs md:text-sm hover:bg-gray-100 transition">
                Có, hãy nhắc
              </button>
              <button className="flex-1 bg-[#0066CC] hover:bg-[#0052A3] px-2 md:px-3 py-1.5 md:py-2 rounded font-medium text-xs md:text-sm transition">
                Mở AI Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TeacherDashboard({ user }: { user: any }) {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen bg-white">
      {/* Welcome Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          Xin chào, {user?.name} | Giáo viên
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!
        </p>
        <p className="text-xs md:text-sm text-gray-600 mt-1">📅 Thứ Ba, 26 Tháng 10, 2023</p>
      </div>

      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Thời khóa biểu hôm nay</h2>
            <a href="#" className="text-xs md:text-sm text-blue-600 hover:underline">Xem tất cả</a>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-sm font-semibold text-gray-600 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded">08:00</span>
              <div>
                <p className="font-semibold text-xs md:text-sm text-gray-900">Lớp 12A1 - Toán học</p>
                <p className="text-[10px] md:text-sm text-gray-600">Phòng học B204 • Tiết 1-2</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-sm font-semibold text-gray-600 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded">10:15</span>
              <div>
                <p className="font-semibold text-xs md:text-sm text-gray-900">Lớp 11B2 - Đại số</p>
                <p className="text-[10px] md:text-sm text-gray-600">Phòng học A102 • Tiết 3-4</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="text-[10px] md:text-sm font-semibold text-gray-600 bg-gray-100 px-1.5 md:px-2 py-0.5 md:py-1 rounded">14:00</span>
              <div>
                <p className="font-semibold text-xs md:text-sm text-gray-900">Lớp 12A5 - Ôn thi THPT</p>
                <p className="text-[10px] md:text-sm text-gray-600">Hội trường lớn • Tiết 6-8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="text-sm md:text-base">🛡️</span>
              Điểm danh
            </h2>
          </div>
          <div className="flex flex-col items-center gap-4 md:gap-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="93.92 100.53" strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="6.69 100.53" strokeDashoffset="-93.92" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900">93%</div>
                  <div className="text-[10px] md:text-sm text-gray-600">Có mặt</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-600 shadow-sm"></span>
                  <span className="text-xs md:text-sm text-gray-900 font-medium">Có mặt</span>
                </div>
                <span className="text-xs md:text-sm text-gray-900 font-medium">42</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-600 shadow-sm"></span>
                  <span className="text-xs md:text-sm text-gray-900 font-medium">Vắng</span>
                </div>
                <span className="text-xs md:text-sm text-gray-900 font-medium">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Smart Alerts */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Cảnh báo AI</h2>
            <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded">AI</span>
          </div>
          <div className="space-y-2 md:space-y-3">
            <div className="border-l-4 border-red-500 bg-red-50 p-2 md:p-3 rounded-r">
              <p className="font-semibold text-xs md:text-sm text-gray-900">Lê Thu Phương</p>
              <p className="text-[10px] md:text-xs text-gray-600">Điểm giảm -15% trong 2 tuần.</p>
            </div>
            <div className="border-l-4 border-gray-400 bg-gray-50 p-2 md:p-3 rounded-r">
              <p className="font-semibold text-xs md:text-sm text-gray-900">Trần Văn B</p>
              <p className="text-[10px] md:text-xs text-gray-600">3 lần vắng liên tiếp.</p>
            </div>
            <div className="border-l-4 border-blue-500 bg-blue-50 p-2 md:p-3 rounded-r">
              <p className="font-semibold text-xs md:text-sm text-gray-900">Nguyễn Hoàng Nam</p>
              <p className="text-[10px] md:text-xs text-gray-600">Toán tăng 20%.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table - full width below */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">Bài nộp gần đây</h2>
          <a href="#" className="text-xs md:text-sm text-blue-600 hover:underline">Xem tất cả</a>
        </div>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs md:text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-gray-700 uppercase text-[10px] md:text-xs">Tên học sinh</th>
                <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-gray-700 uppercase text-[10px] md:text-xs">Bài tập</th>
                <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-gray-700 uppercase text-[10px] md:text-xs">Ngày nộp</th>
                <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-gray-700 uppercase text-[10px] md:text-xs">Trạng thái</th>
                <th className="text-left py-2 md:py-3 px-3 md:px-4 font-semibold text-gray-700 uppercase text-[10px] md:text-xs">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex items-center justify-center text-[10px] md:text-sm font-bold text-gray-700">DH</div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">Đặng Hoàng Nam</span>
                  </div>
                </td>
                <td className="py-2 md:py-3 px-3 md:px-4 text-gray-700 text-xs md:text-sm">Giải tích nâng cao</td>
                <td className="py-2 md:py-3 px-3 md:px-4 text-gray-700 text-xs md:text-sm">Hôm nay, 09:30</td>
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <span className="inline-block bg-green-100 text-green-700 text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded">ĐÃ NỘP</span>
                </td>
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <a href="#" className="text-blue-600 font-semibold hover:underline text-xs md:text-sm">Chấm điểm</a>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-300 flex items-center justify-center text-[10px] md:text-sm font-bold text-gray-700">MT</div>
                    <span className="font-medium text-gray-900 text-xs md:text-sm">Mai Thảo Vy</span>
                  </div>
                </td>
                <td className="py-2 md:py-3 px-3 md:px-4 text-gray-700 text-xs md:text-sm">Bài tập Hình học</td>
                <td className="py-2 md:py-3 px-3 md:px-4 text-gray-700 text-xs md:text-sm">Hôm qua, 04:45 PM</td>
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded">CHỜ DUYỆT</span>
                </td>
                <td className="py-2 md:py-3 px-3 md:px-4">
                  <a href="#" className="text-blue-600 font-semibold hover:underline text-xs md:text-sm">Xem lại</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
