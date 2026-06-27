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
{/* Banner Image */}
<div className="mb-8 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-r from-[#0B3D5C] via-[#0066CC] to-[#3B82F6] h-32 flex items-center justify-center relative">
<div className="absolute inset-0 bg-black/20"></div>
<div className="relative z-10 text-center text-white">
<h2 className="text-2xl font-bold mb-2">🎓 Trường THCS CMC</h2>
<p className="text-blue-100">Hệ thống theo dõi học tập thông minh</p>
</div>
</div>

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
return (
<div className="p-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">
Xin chào, {user?.name}
</h1>
<p className="text-gray-700 text-lg">
Chào mừng bạn trở lại hệ thống quản lý học tập. Chúc bạn một ngày làm việc hiệu quả!
</p>
</div>
)
}
