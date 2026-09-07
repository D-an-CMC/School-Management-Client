const fs = require('fs');

const viPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/lib/locales/vi.json';
const enPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/lib/locales/en.json';

const viDict = JSON.parse(fs.readFileSync(viPath, 'utf8'));
viDict.dashboard = {
  hello: "Xin chào",
  teacher: "Giáo viên",
  welcome: "Chào mừng bạn trở lại hệ thống quản lý học tập.",
  stats: {
    classes: "Lớp học phụ trách",
    students: "Tổng học sinh",
    attendance: "Buổi điểm danh"
  },
  timetable: {
    title: "Lịch dạy hôm nay",
    no_classes: "Không có lịch dạy hôm nay."
  },
  recent_attendance: {
    title: "Điểm danh gần đây",
    no_records: "Chưa có dữ liệu."
  }
};
fs.writeFileSync(viPath, JSON.stringify(viDict, null, 2));

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf8'));
enDict.dashboard = {
  hello: "Hello",
  teacher: "Teacher",
  welcome: "Welcome back to the learning management system.",
  stats: {
    classes: "Assigned Classes",
    students: "Total Students",
    attendance: "Attendance Sessions"
  },
  timetable: {
    title: "Today's Schedule",
    no_classes: "No classes scheduled for today."
  },
  recent_attendance: {
    title: "Recent Attendance",
    no_records: "No records found."
  }
};
fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2));

const dashboardPath = 'c:/Users/phucn/Desktop/project/School-Management-Client/components/dashboard/teacher-dashboard.tsx';
let content = fs.readFileSync(dashboardPath, 'utf8');

// Add import
if (!content.includes("useSettings")) {
  content = content.replace("import { useAcademic } from '@/lib/academic-context'", "import { useAcademic } from '@/lib/academic-context'\nimport { useSettings } from '@/lib/settings-context'");
}

// Add hook
if (!content.includes("const { t } = useSettings()")) {
  content = content.replace("const { user } = useAuth()", "const { user } = useAuth()\n  const { t } = useSettings()");
}

// Replace text
content = content.replace("Xin chào, {user?.name} | Giáo viên", "{t('dashboard.hello')}, {user?.name} | {t('dashboard.teacher')}");
content = content.replace("Chào mừng bạn trở lại hệ thống quản lý học tập.", "{t('dashboard.welcome')}");
content = content.replace("Lớp học phụ trách", "{t('dashboard.stats.classes')}");
content = content.replace("Tổng học sinh", "{t('dashboard.stats.students')}");
content = content.replace("Buổi điểm danh", "{t('dashboard.stats.attendance')}");
content = content.replace("Lịch dạy hôm nay", "{t('dashboard.timetable.title')}");
content = content.replace("Không có lịch dạy hôm nay.", "{t('dashboard.timetable.no_classes')}");
content = content.replace("Điểm danh gần đây", "{t('dashboard.recent_attendance.title')}");
content = content.replace("Chưa có dữ liệu.", "{t('dashboard.recent_attendance.no_records')}");

// Fix bg-white to dark mode
content = content.replace('className="p-4 md:p-6 lg:p-8 min-h-screen bg-white"', 'className="p-4 md:p-6 lg:p-8 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200"');
content = content.replace(/className="text-gray-900"/g, 'className="text-gray-900 dark:text-white"');
content = content.replace(/className="text-gray-500"/g, 'className="text-gray-500 dark:text-gray-400"');
content = content.replace(/className="text-gray-600"/g, 'className="text-gray-600 dark:text-gray-300"');
content = content.replace(/bg-white/g, 'bg-white dark:bg-gray-800');
content = content.replace(/border-gray-100/g, 'border-gray-100 dark:border-gray-700');

fs.writeFileSync(dashboardPath, content);
console.log('Teacher Dashboard translated');
