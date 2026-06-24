export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  department?: string
  classCode?: string
}

export interface Class {
  id: string
  code: string
  name: string
  instructor: string
  students: number
  schedule: string
  room: string
  credits: number
}

export interface Student {
  id: string
  code: string
  name: string
  role: string
  email: string
  phone: string
  class: string
  status: 'active' | 'inactive'
  gpa?: number
  avatar?: string
}

export interface Grade {
  studentId: string
  studentName: string
  studentCode: string
  status15: number | string
  midterm: number | string
  final: number | string
  average: number
  aiRating: string
}

export interface AttendanceRecord {
  date: string
  periodStart: string
  periodEnd: string
  classCode: string
  className: string
  attended: boolean
  note?: string
}

export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Nguyễn Minh Tâm',
  email: 'tam.nguyen@cmc.edu.vn',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tam',
  classCode: '12A1',
}

export const mockTeacher: User = {
  id: 'teacher-1',
  name: 'Thầy Hiệu Trưởng',
  email: 'hieu.truong@cmc.edu.vn',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hieu',
  department: 'Administration',
}

export const mockClasses: Class[] = [
  {
    id: 'class-1',
    code: '12A1',
    name: 'Toán học',
    instructor: 'Thầy Nguyễn Văn A',
    students: 42,
    schedule: 'Thứ 2, 4, 6',
    room: 'B204',
    credits: 3,
  },
  {
    id: 'class-2',
    code: '12A1',
    name: 'Tiếng Anh',
    instructor: 'Cô Trần Thị B',
    students: 42,
    schedule: 'Thứ 3, 5',
    room: 'A102',
    credits: 3,
  },
  {
    id: 'class-3',
    code: '12A1',
    name: 'Vật lý',
    instructor: 'Thầy Lê Văn C',
    students: 42,
    schedule: 'Thứ 2, 4',
    room: 'Phòng Lab',
    credits: 2,
  },
]

export const mockStudents: Student[] = [
  {
    id: 'sv-001',
    code: 'HS-9981',
    name: 'Nguyễn Tuấn Kiệt',
    role: 'Lớp phó Học tập',
    email: 'kiet.nt@student.cmc.edu.vn',
    phone: '0912345xxx',
    class: '12A1',
    status: 'active',
    gpa: 8.5,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kiet',
  },
  {
    id: 'sv-002',
    code: 'HS-9982',
    name: 'Trần Minh Thu',
    role: 'Học sinh',
    email: 'thu.tm@student.cmc.edu.vn',
    phone: '0987654xxx',
    class: '12A1',
    status: 'active',
    gpa: 7.2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu',
  },
  {
    id: 'sv-003',
    code: 'HS-9983',
    name: 'Lê Hoàng Nam',
    role: 'Học sinh',
    email: 'nam.lh@student.cmc.edu.vn',
    phone: '0933445xxx',
    class: '12A1',
    status: 'active',
    gpa: 6.8,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam',
  },
  {
    id: 'sv-004',
    code: 'HS-9984',
    name: 'Phạm Ngọc Anh',
    role: 'Lớp trưởng',
    email: 'anh.pn@student.cmc.edu.vn',
    phone: '0945678xxx',
    class: '12A1',
    status: 'active',
    gpa: 9.0,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anh',
  },
]

export const mockGrades: Grade[] = [
  {
    studentId: 'sv-001',
    studentName: 'Lê Hải Nam',
    studentCode: 'ID: 20240801',
    status15: '9.C',
    midterm: 8.5,
    final: 8.8,
    average: 8.3,
    aiRating: 'Tốt',
  },
  {
    studentId: 'sv-002',
    studentName: 'Nguyễn Anh ThW',
    studentCode: 'ID: 20240802',
    status15: 10,
    midterm: 9.5,
    final: 9.8,
    average: 9.5,
    aiRating: 'Xuất sắc',
  },
  {
    studentId: 'sv-003',
    studentName: 'Phạm Minh Đức',
    studentCode: 'ID: 20240803',
    status15: '6.5',
    midterm: 7.0,
    final: 6.8,
    average: 6.9,
    aiRating: 'Khá',
  },
  {
    studentId: 'sv-004',
    studentName: 'Trần DiSu Linh',
    studentCode: 'ID: 20240804',
    status15: '8.5',
    midterm: 8.9,
    final: 8.7,
    average: 8.5,
    aiRating: 'Tốt',
  },
  {
    studentId: 'sv-005',
    studentName: 'Quách Gia Huy',
    studentCode: 'ID: 20240805',
    status15: '4.C',
    midterm: 5.5,
    final: 5.2,
    average: 4.8,
    aiRating: 'Cần cải thiện',
  },
]

export const mockAttendance: AttendanceRecord[] = [
  {
    date: '2024-11-20',
    periodStart: '07:30',
    periodEnd: '09:00',
    classCode: '12A1',
    className: 'Toán học',
    attended: true,
  },
  {
    date: '2024-11-20',
    periodStart: '09:15',
    periodEnd: '10:45',
    classCode: '12A1',
    className: 'Tiếng Anh',
    attended: true,
  },
  {
    date: '2024-11-20',
    periodStart: '10:45',
    periodEnd: '12:15',
    classCode: '12A1',
    className: 'Vật lý',
    attended: false,
    note: 'Chịu dạng chứng, vắng phép',
  },
]

export const mockDashboardStats = {
  totalStudents: 600,
  totalTeachers: 88,
  totalStaff: 1300,
  totalStaffOffsite: 62,
  presentToday: 97.5,
  presentCount: 1300,
  absenceCount: 40,
}

export const mockAlerts = [
  {
    id: 'alert-1',
    type: 'warning',
    title: 'Lê Thu Phương',
    description: 'GPA drop -15% in the last 2 weeks. Suggested: Schedule 1-on-1 counseling.',
  },
  {
    id: 'alert-2',
    type: 'info',
    title: 'Trần Văn B',
    description: '3 consecutive absences detected. Automatic parent notification sent.',
  },
  {
    id: 'alert-3',
    type: 'success',
    title: 'Nguyễn Hoàng Nam',
    description: 'Mathematics performance increased by 20%. Consider for Excellence Award.',
  },
]

export const mockTeachers: Student[] = [
  {
    id: 'gv-1',
    code: 'GV-2026-001',
    name: 'PGS.TS Trần Minh Anh',
    role: 'Phó Giáo dục',
    email: 'minh.anh.tran@cmc.ec',
    phone: 'N/A',
    class: '12A1',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
  },
  {
    id: 'gv-2',
    code: 'GV-2026-842',
    name: 'ThS. Nguyễn Văn Hùng',
    role: 'Bộ môn',
    email: 'hung.nv@cmc.edu.vn',
    phone: 'N/A',
    class: 'Bộ môn',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung',
  },
  {
    id: 'gv-3',
    code: 'GV-2026-889',
    name: 'TS. Lê Thị Mai',
    role: 'Xã hội',
    email: 'mai.lt@cmc.edu.vn',
    phone: 'N/A',
    class: '11B2',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
  },
  {
    id: 'gv-4',
    code: 'GV-2026-115',
    name: 'ThS. Phạm Tuấn Kiệt',
    role: 'Ngoài Ngủ',
    email: 'kiet.pt@cmc.edu.vn',
    phone: 'N/A',
    class: 'Bộ môn',
    status: 'active',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kiet2',
  },
]

export const mockSchedule = [
  {
    id: '1',
    time: '08:00',
    class: 'Lớp 12A1 - Toán học',
    room: 'Phòng học B204',
    period: 'Tiết 1-2',
  },
  {
    id: '2',
    time: '10:15',
    class: 'Lớp 11B2 - Đại số',
    room: 'Phòng học A102',
    period: 'Tiết 3-4',
  },
  {
    id: '3',
    time: '14:00',
    class: 'Lớp 12A5 - Ôn thi THPT',
    room: 'Hội trường lớn',
    period: 'Tiết 6-8',
  },
]

export const mockTeacherStats = {
  totalTeachers: 50,
  activeTeachers: 50,
  offDutyTeachers: 0,
  totalStudents: 1300,
  activeStudents: 1300,
  acceptedCount: 42,
}
