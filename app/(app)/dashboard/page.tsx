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
<div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
{/* Welcome Section */}
<div className="mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">
Xin chào, {user?.name} | {user?.role === 'student' ? 'Giáo viên' : user?.role}
</h1>
<p className="text-gray-900">Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!</p>
</div>

{/* Main Content Grid */}
<div className="grid grid-cols-3 gap-6">
{/* Left Column */}
<div className="col-span-2 space-y-6">
{/* Online Bulletin */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
<span>📢</span>
Bảng tin Trực tuyến
</h2>
<a href="#" className="text-sm text-[#0066CC] hover:underline">Xem tất cả</a>
</div>
<div className="space-y-4">
{/* Bulletin Item 1 */}
<div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
<div className="flex gap-3">
<div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full h-fit">
SỰ KIỆN
</div>
<div className="flex-1">
<h3 className="font-semibold text-gray-900 mb-1">Hội thảo Hướng nghiệp Khối 9</h3>
<p className="text-sm text-gray-600 mb-2">Kính mời quý phụ huynh tham dự buổi chia sẻ về lộ trình đào...</p>
<div className="flex items-center gap-4 text-xs text-gray-500">
<span>📅 24/10/2023</span>
<span>🕐 08:30 AM</span>
</div>
</div>
</div>
</div>

{/* Bulletin Item 2 */}
<div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition">
<div className="flex gap-3">
<div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full h-fit">
THÔNG BÁO
</div>
<div className="flex-1">
<h3 className="font-semibold text-gray-900 mb-1">Lịch thi Giữa học kỳ I - Năm học 2023-2024</h3>
<p className="text-sm text-gray-600 mb-2">Thông tin chi tiết về lịch thi, phòng thi và nội dung ôn tập...</p>
<div className="flex items-center gap-4 text-xs text-gray-500">
<span>📅 22/10/2023</span>
<span>📍 Toàn khối</span>
</div>
</div>
</div>
</div>
</div>
</div>

{/* Schedule */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
<span>📋</span>
Thời khóa biểu hôm nay
</h2>
<div className="space-y-3">
<div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-[#0066CC]">
<div>
<div className="font-semibold text-gray-900">Tiết 1-2: Toán học</div>
<div className="text-sm text-gray-600">Phòng 402 • T5 Lớp 1</div>
</div>
<div className="ml-auto text-sm font-medium text-gray-700">07:30 - 09:10</div>
</div>
<div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
<div>
<div className="font-semibold text-gray-900">Tiết 3: Tiếng Anh</div>
<div className="text-sm text-gray-600">Phòng 2 • Thầy Mike</div>
</div>
<div className="ml-auto text-sm font-medium text-gray-700">09:30 - 10:15</div>
</div>
<div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
<div>
<div className="font-semibold text-gray-900">Tiết 4-5: Vật lý</div>
<div className="text-sm text-gray-600">Phòng 402 • Thầy Dương</div>
</div>
<div className="ml-auto text-sm font-medium text-gray-700">10:25 - 12:00</div>
</div>
</div>
</div>

{/* Teacher Feedback */}
<div className="bg-gradient-to-r from-[#0B3D5C] to-[#0066CC] rounded-lg border border-[#0066CC] p-6 text-white">
<div className="flex gap-4">
<div className="text-3xl">⭐</div>
<div className="flex-1">
<div className="text-sm font-semibold uppercase opacity-90 mb-2">TIN NHẮN TỪ SỞ GIÁO DỤC</div>
<h3 className="text-lg font-bold mb-3">Lời khuyên từ Giáo viên</h3>
<p className="text-sm leading-relaxed mb-4">
"Minh Anh có thái độ học tập tích cực trong tiết Toán hôm nay. Em đã giải được bài toán nâng cao 10 câu!" - Thầy Trần Hoàng Nam - GV Toán
</p>
<button className="bg-white text-[#0B3D5C] px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition">
Xem chi tiết
</button>
</div>
</div>
</div>
</div>

{/* Right Column */}
<div className="space-y-6">
{/* Attendance Status */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-semibold text-gray-900 flex items-center gap-2">
<span>🛡️</span>
Trạng thái Điểm danh
</h3>
</div>
<div className="flex flex-col items-center gap-6">
<div className="relative w-32 h-32">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
{/* Background circle */}
<circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
{/* Green arc - Có mặt: 42/45 = 93.33% */}
<circle cx="18" cy="18" r="16" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="93.92 100.53" strokeDashoffset="0" strokeLinecap="round" />
{/* Red arc - Vắng: 3/45 = 6.67% */}
<circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="6.69 100.53" strokeDashoffset="-93.92" strokeLinecap="round" />
</svg>
<div className="absolute inset-0 flex items-center justify-center">
<div className="text-center">
<div className="text-3xl font-bold text-gray-900">93%</div>
<div className="text-sm text-gray-600">Có mặt</div>
</div>
</div>
</div>

<div className="flex flex-col gap-2.5">
<div className="flex items-center">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-green-600 shadow-sm"></span>
<span className="text-gray-900 font-medium">Có mặt</span>
</div>
<div className="ml-auto">
<span className="text-gray-900 font-medium">42 học sinh</span>
</div>
</div>
<div className="flex items-center">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-red-600 shadow-sm"></span>
<span className="text-gray-900 font-medium">Vắng</span>
</div>
<div className="ml-36">
<span className="text-gray-900 font-medium">3 học sinh</span>
</div>
</div>
<div className="flex items-center">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-gray-500 shadow-sm"></span>
<span className="text-gray-900 font-medium">Tổng học sinh</span>
</div>
<div className="ml-auto">
<span className="text-gray-900 font-medium">45 học sinh</span>
</div>
</div>
</div>
</div>
</div>

{/* Discipline Status */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center justify-between mb-4">
<h3 className="font-semibold text-gray-900 flex items-center gap-2">
<span>🛡️</span>
Chuyên cần tuần này
</h3>
<span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">TỐT</span>
</div>
<div className="text-center py-6">
<div className="w-32 h-32 mx-auto rounded-full border-8 border-gray-200 flex items-center justify-center bg-gray-50">
<div>
<div className="text-3xl font-bold text-gray-900">98%</div>
<div className="text-xs text-gray-600">Tỷ lệ</div>
</div>
</div>
<div className="mt-4 flex justify-center gap-2">
{['T2', 'T3', 'T4', 'T5', 'T6'].map((day) => (
<div key={day} className="text-center">
<div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center text-xs font-bold text-green-700">
✓
</div>
<div className="text-xs text-gray-600 mt-1">{day}</div>
</div>
))}
</div>
<p className="text-xs text-gray-600 mt-3">Minh Anh chỉ vắng 1 tiết có phép do khám sức khỏe.</p>
</div>
</div>

{/* Learning Progress */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
<span>📈</span>
Tiến độ học tập
</h3>
<div className="space-y-4">
<div>
<div className="flex justify-between items-center mb-2">
<span className="text-sm font-medium text-gray-900">Toán học</span>
<span className="text-sm font-bold text-gray-900">9.2</span>
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-[#0066CC] h-2 rounded-full" style={{ width: '92%' }}></div>
</div>
</div>
<div>
<div className="flex justify-between items-center mb-2">
<span className="text-sm font-medium text-gray-900">Tiếng Anh</span>
<span className="text-sm font-bold text-gray-900">8.8</span>
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-[#0066CC] h-2 rounded-full" style={{ width: '88%' }}></div>
</div>
</div>
<div>
<div className="flex justify-between items-center mb-2">
<span className="text-sm font-medium text-gray-900">Vật lý</span>
<span className="text-sm font-bold text-gray-900">8.5</span>
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div className="bg-[#0066CC] h-2 rounded-full" style={{ width: '85%' }}></div>
</div>
</div>
</div>
<button className="w-full mt-4 text-[#0066CC] text-sm font-semibold hover:underline">
XEM BẢNG ĐIỂM CHI TIẾT
</button>
</div>

{/* AI Chat Widget */}
<div className="bg-gray-900 text-white rounded-lg p-6">
<div className="flex items-center gap-2 mb-4">
<div className="w-10 h-10 bg-[#0066CC] rounded-full flex items-center justify-center">
👑
</div>
<div>
<div className="font-bold">TriVIQ CMC AI</div>
<div className="text-xs text-gray-400">Sản phẩm hỗ trợ bạn</div>
</div>
</div>
<p className="text-sm mb-4 leading-relaxed">
"Hôm nay Minh Anh có bài kiểm tra 15 phút môn Hóa. Bạn có muốn tôi giúp bạn ôn tập không?"
</p>
<div className="flex gap-2">
<button className="flex-1 bg-white text-gray-900 px-3 py-2 rounded font-medium text-sm hover:bg-gray-100 transition">
Có, hãy nhắc
</button>
<button className="flex-1 bg-[#0066CC] hover:bg-[#0052A3] px-3 py-2 rounded font-medium text-sm transition">
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
const currentDate = new Date();
const dateStr = `${currentDate.getDate() <= 9 ? '0' : ''}${currentDate.getDate()}/${currentDate.getMonth() + 1 <= 9 ? '0' : ''}${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

return (
<div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
{/* Welcome Section */}
<div className="mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">
Xin chào, {user?.name} | Giáo viên
</h1>
<p className="text-gray-600 mb-1">Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!</p>
<p className="text-sm text-gray-500">📅 Thứ Ba, 26 Tháng 10, 2023</p>
</div>

{/* Main Content Grid */}
<div className="grid grid-cols-3 gap-6">
{/* Left Column - Classes & Schedule */}
<div className="col-span-2 space-y-6">
{/* Today's Schedule Card */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h2>
<a href="#" className="text-sm text-[#0066CC] hover:underline font-medium">View All</a>
</div>
<div className="space-y-3">
<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-[#0066CC] hover:shadow transition">
<div className="text-sm font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">08:00</div>
<div className="flex-1">
<div className="font-semibold text-gray-900">Lớp 12A1 - Toán học</div>
<div className="text-sm text-gray-600">Phòng học B204 • Tiết 1-2</div>
</div>
</div>
<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 hover:shadow transition">
<div className="text-sm font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">10:15</div>
<div className="flex-1">
<div className="font-semibold text-gray-900">Lớp 11B2 - Đại số</div>
<div className="text-sm text-gray-600">Phòng học A102 • Tiết 3-4</div>
</div>
</div>
<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 hover:shadow transition">
<div className="text-sm font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded">14:00</div>
<div className="flex-1">
<div className="font-semibold text-gray-900">Lớp 12A5 - Ôn thi THPT</div>
<div className="text-sm text-gray-600">Hội trường lớn • Tiết 6-8</div>
</div>
</div>
</div>
</div>

{/* My Classes Card */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center justify-between mb-4">
<h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
<a href="#" className="text-sm text-[#0066CC] hover:underline font-medium">View All</a>
</div>
<div className="grid grid-cols-3 gap-4">
{/* Class Card 1 */}
<div className="border border-gray-200 rounded-lg p-4 hover:shadow transition cursor-pointer">
<div className="flex items-center justify-between mb-3">
<h3 className="font-semibold text-gray-900">Lớp 10A1</h3>
<span className="text-2xl font-bold text-[#0066CC]">10</span>
</div>
<p className="text-sm text-gray-600 mb-2">Chủ nhiệm: Nguyễn Minh Tâm</p>
<div className="pt-3 border-t border-gray-200">
<p className="text-xs font-medium text-gray-600 mb-1">STUDENTS</p>
<p className="text-lg font-bold text-gray-900">42 Học sinh</p>
<p className="text-xs text-gray-500 mt-2">GPA AVG: 8.4/10</p>
</div>
</div>

{/* Class Card 2 */}
<div className="border border-[#0066CC] bg-blue-50 rounded-lg p-4 hover:shadow transition cursor-pointer ring-2 ring-[#0066CC] ring-offset-2">
<div className="flex items-center justify-between mb-3">
<h3 className="font-semibold text-gray-900">Lớp 11B2</h3>
<span className="text-2xl font-bold text-[#0066CC]">11</span>
</div>
<p className="text-sm text-gray-600 mb-2">Chủ nhiệm: Trần Thu Hạ</p>
<div className="pt-3 border-t border-gray-200">
<p className="text-xs font-medium text-gray-600 mb-1">STUDENTS</p>
<p className="text-lg font-bold text-gray-900">38 Học sinh</p>
<p className="text-xs text-gray-500 mt-2">GPA AVG: 7.9/10</p>
</div>
</div>

{/* Class Card 3 */}
<div className="border border-gray-200 rounded-lg p-4 hover:shadow transition cursor-pointer">
<div className="flex items-center justify-between mb-3">
<h3 className="font-semibold text-gray-900">Lớp 12A1</h3>
<span className="text-2xl font-bold text-[#0066CC]">12</span>
</div>
<p className="text-sm text-gray-600 mb-2">Chủ nhiệm: Lê Vợi Hùng</p>
<div className="pt-3 border-t border-gray-200">
<p className="text-xs font-medium text-gray-600 mb-1">STUDENTS</p>
<p className="text-lg font-bold text-gray-900">45 Học sinh</p>
<p className="text-xs text-gray-500 mt-2">GPA AVG: 9.1/10</p>
</div>
</div>
</div>
</div>

{/* Requests & Recommendations */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<h2 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng chuyên cần hằng tuần</h2>
<div className="space-y-3">
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
<p className="text-sm font-medium text-gray-900 mb-1">📊 Phân tích Phó điểm</p>
<p className="text-sm text-gray-600">Phó điểm đang tập trung ở mức 7.0 - 8.5. TTỉ lệ học sinh khá giỏi chiếm 68% tổng số.</p>
</div>
<div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
<p className="text-sm font-medium text-gray-900 mb-1">📋 Chủ giải dự liệu</p>
<p className="text-sm text-gray-600">Dự liệu thực tế (Giáo viên nhập) • Dự báo AI (Dựa trên lịch sử tập)</p>
</div>
</div>
</div>
</div>

{/* Right Column - Alerts & Stats */}
<div className="space-y-6">
{/* AI Insights Alert */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<div className="flex items-center gap-2 mb-4">
<h3 className="font-semibold text-gray-900">AI Insights Alert</h3>
<span className="px-3 py-1 bg-[#0066CC] text-white text-xs font-bold rounded">SMART ENGINE</span>
</div>
<div className="space-y-3">
{/* Alert 1 */}
<div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r">
<p className="font-semibold text-gray-900 mb-1">⚠️ Lê Thu Phương</p>
<p className="text-sm text-gray-600">GPA drop -15% trong 2 tuần. Gợi ý: Lên kế hoạch tư vấn 1-on-1.</p>
</div>

{/* Alert 2 */}
<div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r">
<p className="font-semibold text-gray-900 mb-1">🔔 Trần Văn B</p>
<p className="text-sm text-gray-600">3 lần vắng liên tiếp được phát hiện. Thông báo phụ huynh tự động gửi.</p>
</div>

{/* Alert 3 */}
<div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r">
<p className="font-semibold text-gray-900 mb-1">📈 Nguyễn Hoàng Nam</p>
<p className="text-sm text-gray-600">Thành tích Toán tăng 20%. Hãy xem xét cho Giải thưởng Xuất sắc.</p>
</div>
</div>
</div>

{/* Attendance Status */}
<div className="bg-white rounded-lg border border-gray-200 p-6">
<h3 className="font-semibold text-gray-900 mb-4">Attendance Status</h3>
<div className="flex flex-col items-center">
<div className="relative w-40 h-40">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
<circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="2" />
<circle cx="18" cy="18" r="16" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="84.24 100.53" strokeDashoffset="0" strokeLinecap="round" />
<circle cx="18" cy="18" r="16" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="12.06 100.53" strokeDashoffset="-84.24" strokeLinecap="round" />
</svg>
<div className="absolute inset-0 flex items-center justify-center">
<div className="text-center">
<div className="text-3xl font-bold text-gray-900">93%</div>
<div className="text-xs text-gray-600">Present</div>
</div>
</div>
</div>

<div className="mt-6 w-full space-y-2">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-green-600"></span>
<span className="text-sm text-gray-900">Present</span>
</div>
<span className="text-sm font-semibold text-gray-900">42 students</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-red-600"></span>
<span className="text-sm text-gray-900">Absent</span>
</div>
<span className="text-sm font-semibold text-gray-900">03 students</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-3 h-3 rounded-full bg-gray-500"></span>
<span className="text-sm text-gray-900">Total Expected</span>
</div>
<span className="text-sm font-semibold text-gray-900">45 students</span>
</div>
</div>
</div>
</div>

{/* Performance Alert Card */}
<div className="bg-gradient-to-br from-[#0B3D5C] to-[#0066CC] rounded-lg p-6 text-white">
<h3 className="font-semibold mb-2">Thống kê điểm danh</h3>
<p className="text-sm text-blue-100 mb-4">Học sinh vắng mặt không phép cần được xử lý ngay tuần này để tránh ảnh hưởng đến quá trình học tập.</p>
<button className="w-full bg-white text-[#0066CC] px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition">
Full AI Analysis Report →
</button>
</div>
</div>
</div>
</div>
)
}
